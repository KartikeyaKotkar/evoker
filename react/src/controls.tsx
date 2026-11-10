'use client';
import { forwardRef } from 'react';
import type { HTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Input as BaseInput } from '@base-ui/react/input';
import { Field as BaseField } from '@base-ui/react/field';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import { cx, partClass } from './style-utils.js';

export type InputProps = BaseInput.Props;
export const Input = forwardRef<HTMLElement, InputProps>(function Input({ className, ...props }, ref) {
  return <BaseInput {...props} ref={ref} className={partClass('evoker-input', className)} />;
});
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea {...props} ref={ref} className={cx('evoker-input evoker-textarea', className)} />;
});

export const Field = {
  Root: forwardRef<HTMLDivElement, BaseField.Root.Props>(function FieldRoot({ className, ...props }, ref) { return <BaseField.Root {...props} ref={ref} className={partClass('evoker-field', className)} />; }),
  Label: forwardRef<HTMLLabelElement, BaseField.Label.Props>(function FieldLabel({ className, ...props }, ref) { return <BaseField.Label {...props} ref={ref} className={partClass('evoker-label', className)} />; }),
  Control: forwardRef<HTMLElement, BaseField.Control.Props>(function FieldControl({ className, ...props }, ref) { return <BaseField.Control {...props} ref={ref} className={partClass('evoker-input', className)} />; }),
  Description: forwardRef<HTMLParagraphElement, BaseField.Description.Props>(function FieldDescription({ className, ...props }, ref) { return <BaseField.Description {...props} ref={ref} className={partClass('evoker-description', className)} />; }),
  Error: forwardRef<HTMLDivElement, BaseField.Error.Props>(function FieldError({ className, ...props }, ref) { return <BaseField.Error {...props} ref={ref} className={partClass('evoker-error', className)} />; }),
  Validity: BaseField.Validity,
};

export type CheckboxProps = BaseCheckbox.Root.Props;
export const Checkbox = forwardRef<HTMLElement, CheckboxProps>(function Checkbox({ className, children, ...props }, ref) {
  return <BaseCheckbox.Root {...props} ref={ref} className={partClass('evoker-checkbox', className)}>
    <BaseCheckbox.Indicator className="evoker-checkbox-indicator">{children ?? '✓'}</BaseCheckbox.Indicator>
  </BaseCheckbox.Root>;
});
export type SwitchProps = BaseSwitch.Root.Props;
export const Switch = forwardRef<HTMLElement, SwitchProps>(function Switch({ className, children, ...props }, ref) {
  return <BaseSwitch.Root {...props} ref={ref} className={partClass('evoker-switch', className)}><BaseSwitch.Thumb className="evoker-switch-thumb" />{children}</BaseSwitch.Root>;
});

export const Slider = {
  Root: BaseSlider.Root,
  Label: BaseSlider.Label,
  Value: BaseSlider.Value,
  Control: forwardRef<HTMLDivElement, BaseSlider.Control.Props>(function SliderControl({ className, ...props }, ref) { return <BaseSlider.Control {...props} ref={ref} className={partClass('evoker-slider-control', className)} />; }),
  Track: forwardRef<HTMLDivElement, BaseSlider.Track.Props>(function SliderTrack({ className, ...props }, ref) { return <BaseSlider.Track {...props} ref={ref} className={partClass('evoker-slider-track', className)} />; }),
  Indicator: forwardRef<HTMLDivElement, BaseSlider.Indicator.Props>(function SliderIndicator({ className, ...props }, ref) { return <BaseSlider.Indicator {...props} ref={ref} className={partClass('evoker-slider-indicator', className)} />; }),
  Thumb: forwardRef<HTMLDivElement, BaseSlider.Thumb.Props>(function SliderThumb({ className, ...props }, ref) { return <BaseSlider.Thumb {...props} ref={ref} className={partClass('evoker-slider-thumb', className)} />; }),
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> { variant?: 'solid' | 'outline' }
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ variant = 'solid', className, ...props }, ref) {
  return <span {...props} ref={ref} className={cx('evoker-badge', `evoker-badge--${variant}`, className)} />;
});
export const Separator = forwardRef<HTMLHRElement, HTMLAttributes<HTMLHRElement>>(function Separator({ className, ...props }, ref) { return <hr {...props} ref={ref} className={cx('evoker-separator', className)} />; });

export const Card = {
  Root: forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardRoot({ className, ...props }, ref) { return <div {...props} ref={ref} className={cx('evoker-card', className)} />; }),
  Header: forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardHeader({ className, ...props }, ref) { return <div {...props} ref={ref} className={cx('evoker-card-header', className)} />; }),
  Title: forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(function CardTitle({ className, ...props }, ref) { return <h3 {...props} ref={ref} className={cx('evoker-card-title', className)} />; }),
  Description: forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function CardDescription({ className, ...props }, ref) { return <p {...props} ref={ref} className={cx('evoker-description', className)} />; }),
  Content: forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardContent({ className, ...props }, ref) { return <div {...props} ref={ref} className={cx('evoker-card-content', className)} />; }),
  Footer: forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardFooter({ className, ...props }, ref) { return <div {...props} ref={ref} className={cx('evoker-card-footer', className)} />; }),
};
