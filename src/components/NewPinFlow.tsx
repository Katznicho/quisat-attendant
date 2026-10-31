import React, { useState } from 'react';

import PinPad from './PinPad';

type Props = {
  title: string;
  confirmTitle?: string;
  subtitle?: string;
  /** Throw (or reject) with a message to show it and start over. */
  onConfirmed: (pin: string) => Promise<void>;
};

/** Enter a new 4-digit PIN, then confirm it. Mismatches restart the flow. */
export default function NewPinFlow({ title, confirmTitle = 'Enter the PIN again', subtitle, onConfirmed }: Props) {
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const restart = (message: string) => {
    setFirst(null);
    setError(message);
    setResetKey((key) => key + 1);
  };

  const handle = async (pin: string) => {
    if (first === null) {
      if (/^(\d)\1{3}$/.test(pin) || pin === '1234') {
        restart('That PIN is too easy to guess. Choose another.');
        return;
      }
      setFirst(pin);
      setError(null);
      setResetKey((key) => key + 1);
      return;
    }

    if (pin !== first) {
      restart('The PINs did not match. Start again.');
      return;
    }

    setBusy(true);
    try {
      await onConfirmed(pin);
    } catch (e) {
      restart(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PinPad
      title={first === null ? title : confirmTitle}
      subtitle={first === null ? subtitle : undefined}
      error={error}
      busy={busy}
      resetKey={resetKey}
      onComplete={handle}
    />
  );
}
