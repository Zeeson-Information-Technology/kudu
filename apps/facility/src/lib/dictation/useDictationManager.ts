import { useEffect, useMemo, useRef, useState } from "react";

export type DictationFieldState = {
  raw: string;
  startedAt?: string;
  endedAt?: string;
  confirmedAt?: string;
  requiresReview: boolean;
};

type DictationState<T extends string> = Record<T, DictationFieldState>;

type DictationManagerOptions<T extends string> = {
  fields: readonly T[];
  onValueChange: (field: T, value: string) => void;
  lang?: string;
};

type DictationManager<T extends string> = {
  supported: boolean;
  activeField: T | null;
  isActive: (field: T) => boolean;
  state: DictationState<T>;
  start: (field: T) => void;
  stop: () => void;
  confirm: (field: T) => void;
  markEdited: (field: T) => void;
  warning: boolean;
};

const buildState = <T extends string>(fields: readonly T[]) => {
  const next = {} as DictationState<T>;
  fields.forEach((field) => {
    next[field] = {
      raw: "",
      startedAt: undefined,
      endedAt: undefined,
      confirmedAt: undefined,
      requiresReview: false
    };
  });
  return next;
};

const buildRawMap = <T extends string>(fields: readonly T[]) => {
  const next = {} as Record<T, string>;
  fields.forEach((field) => {
    next[field] = "";
  });
  return next;
};

export const useDictationManager = <T extends string>({
  fields,
  onValueChange,
  lang = "en-NG"
}: DictationManagerOptions<T>): DictationManager<T> => {
  const [supported, setSupported] = useState(false);
  const [dictationActive, setDictationActive] = useState(false);
  const [state, setState] = useState<DictationState<T>>(() => buildState(fields));
  const recognitionRef = useRef<any>(null);
  const activeFieldRef = useRef<T | null>(null);
  const nextFieldRef = useRef<T | null>(null);
  const rawRef = useRef<Record<T, string>>(buildRawMap(fields));

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    setSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      const field = activeFieldRef.current;
      if (!field) {
        return;
      }

      let interim = "";
      let finalText = rawRef.current[field];

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0]?.transcript?.trim() ?? "";
        if (!transcript) {
          continue;
        }
        if (result.isFinal) {
          finalText = `${finalText}${finalText ? " " : ""}${transcript}`;
        } else {
          interim = `${interim}${interim ? " " : ""}${transcript}`;
        }
      }

      rawRef.current[field] = finalText;
      const combined = [finalText, interim].filter(Boolean).join(" ");
      onValueChange(field, combined);
      setState((prev) => ({
        ...prev,
        [field]: { ...prev[field], raw: finalText, requiresReview: true }
      }));
    };

    recognition.onend = () => {
      setDictationActive(false);
      const field = activeFieldRef.current;
      if (field) {
        setState((prev) => ({
          ...prev,
          [field]: {
            ...prev[field],
            endedAt: new Date().toISOString(),
            requiresReview: true
          }
        }));
      }

      if (nextFieldRef.current) {
        const nextField = nextFieldRef.current;
        nextFieldRef.current = null;
        start(nextField);
      }
    };

    recognition.onerror = () => {
      setDictationActive(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [lang, onValueChange]);

  const start = (field: T) => {
    if (!recognitionRef.current) {
      return;
    }

    if (dictationActive && activeFieldRef.current && activeFieldRef.current !== field) {
      nextFieldRef.current = field;
      recognitionRef.current.stop();
      return;
    }

    if (dictationActive && activeFieldRef.current === field) {
      recognitionRef.current.stop();
      return;
    }

    activeFieldRef.current = field;
    setState((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        startedAt: new Date().toISOString(),
        confirmedAt: undefined,
        requiresReview: true
      }
    }));
    setDictationActive(true);
    recognitionRef.current.start();
  };

  const stop = () => {
    if (!recognitionRef.current) {
      return;
    }
    recognitionRef.current.stop();
    setDictationActive(false);
  };

  const confirm = (field: T) => {
    setState((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        confirmedAt: new Date().toISOString(),
        requiresReview: false
      }
    }));
  };

  const markEdited = (field: T) => {
    setState((prev) => {
      const current = prev[field];
      const hasDictation =
        !!current.raw || !!current.startedAt || !!current.endedAt || !!current.confirmedAt;
      if (!hasDictation) {
        return prev;
      }
      return {
        ...prev,
        [field]: { ...current, requiresReview: true }
      };
    });
  };

  const warning = useMemo(() => {
    const entries = Object.values(state) as DictationFieldState[];
    return entries.some((entry) => entry.requiresReview);
  }, [state]);

  return {
    supported,
    activeField: activeFieldRef.current,
    isActive: (field) => dictationActive && activeFieldRef.current === field,
    state,
    start,
    stop,
    confirm,
    markEdited,
    warning
  };
};
