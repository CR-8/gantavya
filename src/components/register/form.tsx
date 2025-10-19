"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { XIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitRegistration, checkEmailRegistration } from '@/lib/supabaseService';
import { supabase } from '@/lib/supabase';

// Form schema with validation
const registrationSchema = z.object({
  teamName: z
    .string()
    .min(3, 'Team name must be at least 3 characters.')
    .max(50, 'Team name must be at most 50 characters.'),
  teamLeader: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Enter a valid email address.'),
    phone: z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number.'),
    college: z.string().min(2, 'College name is required.'),
  }),
  teamMembers: z
    .array(
      z.object({
        name: z.string().min(2, 'Name must be at least 2 characters.'),
        email: z.string().email('Enter a valid email address.'),
        phone: z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number.'),
        college: z.string().min(2, 'College name is required.'),
      })
    )
    .optional(),
  paymentMethod: z.enum(['UPI', 'Net Banking', 'Card']).optional(),
  transactionId: z.string().min(5, 'Transaction ID must be at least 5 characters.').optional(),
  additionalInfo: z.string().max(500, 'Additional info must be at most 500 characters.').optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  eventTitle: string;
  eventSlug: string;
  participationFee: string;
  teamSize: string;
  onClose: () => void;
}

export function RegistrationForm({
  eventTitle,
  eventSlug,
  teamSize,
  onClose,
}: RegistrationFormProps) {
  // Submission UI state
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Multi-step flow state: 1 = Basic Details, 2 = Event Selection, 3 = Payment & Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Events fetched from backend
  interface EventItem {
    slug: string;
    title: string;
    registration_fee?: number;
    team_size_max?: number;
    description?: string;
  }
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]); // array of event slugs

  // Pricing / fees
  const platformFeeRate = 0.02; // 2% platform fee (configurable)
  const taxRate = 0.18; // GST 18%

  // File upload (team leader ID proof)
  const [leaderIdFile, setLeaderIdFile] = useState<File | null>(null);
  const [leaderIdError, setLeaderIdError] = useState<string | null>(null);

  // Auto-save draft key
  const draftKey = `registration_draft_${eventSlug}`;
  const saveTimeout = useRef<number | null>(null);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      teamName: '',
      teamLeader: {
        name: '',
        email: '',
        phone: '',
        college: '',
      },
      teamMembers: [],
      paymentMethod: undefined,
      transactionId: '',
      additionalInfo: '',
    },
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'teamMembers',
  });

  const maxTeamMembers = parseInt(teamSize.split('-')[1]) || 4;

  // Fetch events from Supabase
  useEffect(() => {
    let cancelled = false;
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('slug,title,registration_fee,team_size_min,team_size_max,description,category')
          .eq('status', 'published')
          .order('date_from', { ascending: true });

        if (error) {
          console.error('Error fetching events:', error);
          return;
        }

        if (!cancelled && data) setEvents(data);
      } catch (err) {
        console.error('Unexpected fetch events error:', err);
      }
    }

    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  // Restore draft if present
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        form.reset(parsed.formValues);
        setSelectedEvents(parsed.selectedEvents || []);
      }
    } catch {
      // ignore
    }
  }, [draftKey, form]);

  // Autosave draft when form values or selectedEvents change
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
      // debounce save
      saveTimeout.current = window.setTimeout(() => {
        try {
          localStorage.setItem(
            draftKey,
            JSON.stringify({ formValues: value, selectedEvents })
          );
        } catch {
          // ignore
        }
      }, 500) as unknown as number;
    });

    return () => subscription.unsubscribe();
  }, [form, selectedEvents, draftKey]);

  // Helper: calculate totals from selectedEvents
  const calculateTotals = useCallback(() => {
    const selected = events.filter((e) => selectedEvents.includes(e.slug));
    const baseTotal = selected.reduce((sum, e) => sum + Number(e.registration_fee || 0), 0);
    const platformFee = baseTotal * platformFeeRate;
    const tax = (baseTotal + platformFee) * taxRate;
    const final = baseTotal + platformFee + tax;
    return { baseTotal, platformFee, tax, final };
  }, [events, selectedEvents]);

  // File upload validation
  function handleLeaderIdFile(file?: File | null) {
    setLeaderIdError(null);
    if (!file) {
      setLeaderIdFile(null);
      return;
    }
    if (file.type !== 'application/pdf') {
      setLeaderIdError('Only PDF files are allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLeaderIdError('File size must be ≤ 2MB');
      return;
    }
    setLeaderIdFile(file);
  }

  // Move to next step with server-side validation guard
  async function goToNextStep() {
    if (step === 1) {
      // require at least one participant (leader included)
      const leader = form.getValues('teamLeader');
      const members = form.getValues('teamMembers') || [];
      if (!leader?.email) {
        setSubmitStatus('error');
        setSubmitMessage('Please provide team leader contact details');
        return;
      }

      // enforce unique emails
      const emails = [leader.email, ...(members.map((m) => m.email) || [])];
      const unique = new Set(emails);
      if (unique.size !== emails.length) {
        setSubmitStatus('error');
        setSubmitMessage('Participant emails must be unique');
        return;
      }

      // enforce single leader
      // (UI already ensures single leader via leader fields)

      // require file when leader selected
      if (!leaderIdFile) {
        setLeaderIdError('Upload leader ID proof (PDF, ≤2MB) to continue');
        return;
      }

      // server-side quick validation: check leader email duplicate for selected events
      for (const slug of selectedEvents) {
        const res = await checkEmailRegistration(slug, leader.email);
        if (res.exists) {
          setSubmitStatus('error');
          setSubmitMessage(`Leader email already registered for event ${slug}`);
          return;
        }
      }

      // clear any lingering errors
      setSubmitStatus('idle');
      setSubmitMessage('');
      setStep(2);
    } else if (step === 2) {
      if (selectedEvents.length === 0) {
        setSubmitStatus('error');
        setSubmitMessage('Please select at least one event');
        return;
      }
      // server-side check for event capacity maybe later
      setStep(3);
    }
  }

  function goToPrevStep() {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 rounded-2xl border border-neutral-800">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-neutral-900 border-b border-neutral-800 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Register for {eventTitle}</h2>
              <p className="text-sm text-neutral-400">
                Fill in the details below to register your team
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <XIcon className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <div className="mx-6 mt-6 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-300">Registration Successful!</h3>
              <p className="text-sm text-green-200 mt-1">{submitMessage}</p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mx-6 mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-300">Registration Failed</h3>
              <p className="text-sm text-red-200 mt-1">{submitMessage}</p>
            </div>
          </div>
        )}

        {/* Multi-step Form */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`px-3 py-1 rounded-full text-sm ${step === 1 ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}>1. Basic Details</div>
            <div className={`px-3 py-1 rounded-full text-sm ${step === 2 ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}>2. Event Selection</div>
            <div className={`px-3 py-1 rounded-full text-sm ${step === 3 ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}>3. Payment</div>
          </div>

          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); goToNextStep(); }} className="space-y-6">
              {/* Reuse team name */}
              <Controller
                name="teamName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <label htmlFor="teamName" className="text-sm font-medium text-white">Team Name <span className="text-red-500">*</span></label>
                    <Input {...field} id="teamName" placeholder="Enter your team name" className={`bg-neutral-800 border-neutral-700 text-white ${fieldState.invalid ? 'border-red-500' : ''}`} />
                    {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                  </div>
                )}
              />

              {/* Leader block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller name="teamLeader.name" control={form.control} render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Full Name <span className="text-red-500">*</span></label>
                    <Input {...field} placeholder="John Doe" className={`bg-neutral-800 border-neutral-700 text-white ${fieldState.invalid ? 'border-red-500' : ''}`} />
                    {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                  </div>
                )} />

                <Controller name="teamLeader.email" control={form.control} render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Email <span className="text-red-500">*</span></label>
                    <Input {...field} type="email" placeholder="john@example.com" className={`bg-neutral-800 border-neutral-700 text-white ${fieldState.invalid ? 'border-red-500' : ''}`} />
                    {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                  </div>
                )} />

                <Controller name="teamLeader.phone" control={form.control} render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Phone <span className="text-red-500">*</span></label>
                    <Input {...field} placeholder="9876543210" className={`bg-neutral-800 border-neutral-700 text-white ${fieldState.invalid ? 'border-red-500' : ''}`} />
                    {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                  </div>
                )} />

                <Controller name="teamLeader.college" control={form.control} render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">College <span className="text-red-500">*</span></label>
                    <Input {...field} placeholder="College name" className={`bg-neutral-800 border-neutral-700 text-white ${fieldState.invalid ? 'border-red-500' : ''}`} />
                    {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                  </div>
                )} />
              </div>

              {/* Team members dynamic block (small version) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Team Members (Optional)</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', email: '', phone: '', college: '' })} disabled={fields.length >= maxTeamMembers - 1}>Add Member</Button>
                </div>
                {fields.length > 0 && (
                  <div className="space-y-3">
                    {fields.map((f, i) => (
                      <div key={f.id} className="p-3 bg-neutral-800/40 rounded">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Controller name={`teamMembers.${i}.name`} control={form.control} render={({ field }) => (<Input {...field} placeholder="Member name" className="bg-neutral-800 text-white text-sm" />)} />
                          <Controller name={`teamMembers.${i}.email`} control={form.control} render={({ field }) => (<Input {...field} placeholder="member@example.com" className="bg-neutral-800 text-white text-sm" />)} />
                        </div>
                        <div className="flex justify-end mt-2">
                          <Button type="button" variant="outline" onClick={() => remove(i)}>Remove</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-neutral-500">Team size: {teamSize}. You can add up to {maxTeamMembers - 1} additional member(s).</p>
              </div>

              {/* Leader ID upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Leader ID Proof (PDF, ≤2MB)</label>
                <input type="file" accept="application/pdf" onChange={(e) => handleLeaderIdFile(e.target.files?.[0] || null)} className="w-full text-sm" />
                {leaderIdError && <p className="text-xs text-red-500">{leaderIdError}</p>}
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">Continue to Event Selection</Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Select Events</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {events.map((e: { slug: string; title: string; description?: string; registration_fee?: number; team_size_max?: number }) => (
                  <div key={e.slug} className={`p-4 rounded-lg border ${selectedEvents.includes(e.slug) ? 'border-blue-600 bg-blue-600/10' : 'border-neutral-700 bg-neutral-800'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{e.title}</h4>
                        <p className="text-xs text-neutral-400">{String(e.description || '').slice(0, 120)}</p>
                        <p className="text-xs text-neutral-400 mt-2">Fee: ₹{e.registration_fee || 0} • Max Team: {e.team_size_max || '-'}</p>
                      </div>
                      <div>
                        <input type="checkbox" checked={selectedEvents.includes(e.slug)} onChange={(ev) => { if (ev.target.checked) setSelectedEvents((s) => [...s, e.slug]); else setSelectedEvents((s) => s.filter((x) => x !== e.slug)); }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPrevStep}>Back</Button>
                <Button onClick={goToNextStep}>Continue to Payment</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Payment & Confirmation</h3>
              <div className="p-4 bg-neutral-800 rounded border border-neutral-700">
                <h4 className="font-medium text-white">Summary</h4>
                <div className="mt-2 text-sm text-neutral-300">
                  <p>Team: <strong className="text-white">{form.getValues('teamName')}</strong></p>
                  <p>Leader: {form.getValues('teamLeader')?.name} • {form.getValues('teamLeader')?.email}</p>
                  <p className="mt-2">Selected Events:</p>
                  <ul className="list-disc pl-6">
                    {events.filter((ev: { slug: string }) => selectedEvents.includes(ev.slug)).map((ev: { slug: string; title: string; registration_fee?: number }) => (<li key={ev.slug}>{ev.title} — ₹{ev.registration_fee || 0}</li>))}
                  </ul>
                </div>
                <div className="mt-4">
                  {(() => {
                    const t = calculateTotals();
                    return (
                      <div className="text-sm text-neutral-300">
                        <p>Base Total: ₹{t.baseTotal.toFixed(2)}</p>
                        <p>Platform Fee (2%): ₹{t.platformFee.toFixed(2)}</p>
                        <p>GST (18%): ₹{t.tax.toFixed(2)}</p>
                        <p className="mt-2 font-semibold text-white">Payable: ₹{t.final.toFixed(2)}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-neutral-400">We&apos;ll create an order on the backend and open Razorpay checkout here.</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={goToPrevStep}>Back</Button>
                  <Button onClick={async () => {
                    setSubmitStatus('idle');
                    setSubmitMessage('Uploading ID proof and creating registration...');

                    // Upload leader ID file via API route
                    let uploadedUrl: string | null = null;
                    if (leaderIdFile) {
                      const fd = new FormData();
                      fd.append('file', leaderIdFile);
                      fd.append('bucket', 'registrations'); // Use default bucket
                      fd.append('path', `id-proofs/leaders/${Date.now()}_${leaderIdFile.name}`);

                      try {
                        const upl = await fetch('/api/upload', { method: 'POST', body: fd });
                        const uplJson = await upl.json();
                        if (upl.ok && uplJson.publicURL) {
                          uploadedUrl = uplJson.publicURL;
                        } else {
                          setSubmitStatus('error');
                          setSubmitMessage(uplJson.error || 'Failed to upload ID proof. Please ensure the "registrations" bucket exists in Supabase Storage.');
                          return;
                        }
                      } catch (e) {
                        setSubmitStatus('error');
                        setSubmitMessage('Upload failed: ' + (e instanceof Error ? e.message : 'Network error'));
                        return;
                      }
                    }

                    const payload = {
                      eventSlug: eventSlug,
                      teamName: form.getValues('teamName'),
                      teamLeader: form.getValues('teamLeader'),
                      teamMembers: form.getValues('teamMembers') || [],
                      paymentMethod: 'Razorpay',
                      transactionId: '',
                      additionalInfo: form.getValues('additionalInfo') || '',
                      leaderIdProofUrl: uploadedUrl || undefined,
                    };

                    const resp = await submitRegistration(payload);
                    if (resp.success) {
                      // Send registration confirmation email
                      try {
                        const totals = calculateTotals();
                        
                        const emailResponse = await fetch('/api/send-registration-email', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            teamName: form.getValues('teamName'),
                            leaderName: form.getValues('teamLeader.name'),
                            leaderEmail: form.getValues('teamLeader.email'),
                            leaderPhone: form.getValues('teamLeader.phone'),
                            college: form.getValues('teamLeader.college'),
                            members: form.getValues('teamMembers') || [],
                            events: selectedEvents.map(slug => {
                              const evt = events.find((e: { slug: string }) => e.slug === slug);
                              return {
                                name: evt?.title || slug,
                                price: parseFloat(String(evt?.registration_fee || '0')),
                              };
                            }),
                            totalAmount: totals.baseTotal,
                            platformFee: totals.platformFee,
                            gst: totals.tax,
                            finalAmount: totals.final,
                            registrationId: resp.registrationId,
                          }),
                        });

                        const emailResult = await emailResponse.json();
                        if (!emailResult.success) {
                          console.warn('Failed to send confirmation email:', emailResult.error);
                          // Don&apos;t fail the registration if email fails
                        }
                      } catch (emailError) {
                        console.error('Error sending confirmation email:', emailError);
                        // Continue even if email fails
                      }

                      setSubmitStatus('success');
                      setSubmitMessage('Registration created successfully! A confirmation email has been sent. Proceed to payment.');
                      // TODO: create Razorpay order on backend and call checkout
                    } else {
                      setSubmitStatus('error');
                      setSubmitMessage(resp.error || 'Failed to create registration');
                    }
                  }}>Pay & Confirm</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
