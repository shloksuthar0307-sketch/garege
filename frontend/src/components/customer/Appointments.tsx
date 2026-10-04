import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Plus, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '../../api/customer';

export function Appointments() {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['customer-appointments'],
    queryFn: customerApi.getAppointments,
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight mb-2">Appointments</h1>
          <p className="text-gray-400">Manage your upcoming service visits.</p>
        </div>
        <button className="bg-white text-black px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Book Service
        </button>
      </div>

      <div className="space-y-4">
        {appointments?.length === 0 ? (
          <div className="text-gray-400 text-center py-12 border border-dashed border-[var(--border-subtle)] rounded-3xl">
            No upcoming appointments.
          </div>
        ) : (
          appointments?.map((appt: any) => (
            <div key={appt.id} className="bg-[#111] border border-[var(--border-subtle)] rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--bg-surface-hover)] rounded-bl-full pointer-events-none" />
              
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">Upcoming Visit</h3>
              
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-medium text-[var(--text-primary)] mb-4">{appt.service_type || 'Vehicle Inspection'}</h2>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-gray-300">
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center"><Calendar className="w-4 h-4 text-gray-400" /></div>
                      <span className="font-medium text-[var(--text-primary)]">{new Date(appt.date || appt.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center"><Clock className="w-4 h-4 text-gray-400" /></div>
                      <span className="font-medium text-[var(--text-primary)]">{new Date(appt.date || appt.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center"><MapPin className="w-4 h-4 text-gray-400" /></div>
                      <span className="font-medium text-[var(--text-primary)]">Branch: {appt.branch || 'Main Center'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col w-full md:w-auto gap-3">
                  <button className="px-6 py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-gray-200 transition-colors w-full md:w-48 text-center">
                    View Details
                  </button>
                  <button className="px-6 py-3 rounded-xl border border-[var(--border-default)] text-[var(--text-primary)] font-medium text-sm hover:bg-[var(--bg-surface-hover)] transition-colors w-full md:w-48 text-center">
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
