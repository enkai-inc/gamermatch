'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { JournalStats } from '@/components/journal/journal-stats';
import { JournalList } from '@/components/journal/journal-list';
import { AddJournalEntry } from '@/components/journal/add-journal-entry';

export default function JournalPage() {
  const [showAdd, setShowAdd] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleAdded = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Play Journal</h1>
          <p className="mt-1 text-slate-400">Track your gaming sessions and history.</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>Add Game</Button>
      </div>

      {/* Stats */}
      <JournalStats key={`stats-${refreshKey}`} />

      {/* Journal List */}
      <JournalList key={`list-${refreshKey}`} />

      {/* Add Entry Dialog */}
      <AddJournalEntry
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={handleAdded}
      />
    </div>
  );
}
