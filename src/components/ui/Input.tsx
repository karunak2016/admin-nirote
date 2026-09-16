import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900',
          'focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800',
          'placeholder:text-gray-400',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  ),
)
Input.displayName = 'Input'
