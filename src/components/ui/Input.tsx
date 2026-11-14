import { useId, type InputHTMLAttributes } from 'react';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id'> & {
    label: string;
    /** Small text under the field. */
    helper?: string;
    className?: string;
};

/** Text input with label and optional helper. Focus shows the yellow 2px ring. */
export function Input({ label, helper, className = '', ...props }: InputProps) {
    const id = useId();
    const helperId = `${id}-helper`;

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <label htmlFor={id} className="text-sm leading-[1.2] font-medium text-fg">
                {label}
            </label>
            <input
                id={id}
                aria-describedby={helper ? helperId : undefined}
                className="h-11 w-full rounded-md border border-line-strong bg-surface px-3 text-base leading-[1.6] text-fg transition-colors placeholder:text-fg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                {...props}
            />
            {helper && (
                <p id={helperId} className="text-xs leading-[1.4] text-fg-muted">
                    {helper}
                </p>
            )}
        </div>
    );
}
