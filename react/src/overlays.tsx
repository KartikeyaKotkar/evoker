'use client';
import { createContext, forwardRef, useContext, useId, useLayoutEffect, useMemo, useState } from 'react';
import type { HTMLAttributes } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { Select as BaseSelect } from '@base-ui/react/select';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { PortalTheme } from './theme.js';
import { cx, partClass } from './style-utils.js';

export const DialogParts = {
  Root: BaseDialog.Root,
  Trigger: BaseDialog.Trigger,
  Close: BaseDialog.Close,
  Portal: function DialogPortal({ children, ...props }: BaseDialog.Portal.Props) { return <BaseDialog.Portal {...props}><PortalTheme>{children}</PortalTheme></BaseDialog.Portal>; },
  Backdrop: forwardRef<HTMLDivElement, BaseDialog.Backdrop.Props>(function DialogBackdrop({ className, ...props }, ref) { return <BaseDialog.Backdrop {...props} ref={ref} className={partClass('evoker-modal-backdrop', className)} />; }),
  Content: forwardRef<HTMLDivElement, BaseDialog.Popup.Props>(function DialogContent({ className, ...props }, ref) { return <BaseDialog.Popup {...props} ref={ref} className={partClass('evoker-modal', className)} />; }),
  Title: forwardRef<HTMLHeadingElement, BaseDialog.Title.Props>(function DialogTitle({ className, ...props }, ref) { return <BaseDialog.Title {...props} ref={ref} className={partClass('evoker-modal-title', className)} />; }),
  Description: forwardRef<HTMLParagraphElement, BaseDialog.Description.Props>(function DialogDescription({ className, ...props }, ref) { return <BaseDialog.Description {...props} ref={ref} className={partClass('evoker-description', className)} />; }),
  Footer: forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DialogFooter({ className, ...props }, ref) { return <div {...props} ref={ref} className={cx('evoker-modal-footer', className)} />; }),
};

export const TabsParts = {
  Root: forwardRef<HTMLDivElement, BaseTabs.Root.Props>(function TabsRoot({ className, ...props }, ref) { return <BaseTabs.Root {...props} ref={ref} className={partClass('evoker-tabs-root', className)} />; }),
  List: forwardRef<HTMLDivElement, BaseTabs.List.Props>(function TabsList({ className, ...props }, ref) { return <BaseTabs.List {...props} ref={ref} className={partClass('evoker-tabs-list', className)} />; }),
  Trigger: forwardRef<HTMLElement, BaseTabs.Tab.Props>(function TabsTrigger({ className, ...props }, ref) { return <BaseTabs.Tab {...props} ref={ref} className={partClass('evoker-tabs-trigger', className)} />; }),
  Content: forwardRef<HTMLDivElement, BaseTabs.Panel.Props>(function TabsContent({ className, ...props }, ref) { return <BaseTabs.Panel {...props} ref={ref} className={partClass('evoker-tabs-content', className)} />; }),
  Indicator: forwardRef<HTMLSpanElement, BaseTabs.Indicator.Props>(function TabsIndicator({ className, ...props }, ref) { return <BaseTabs.Indicator {...props} ref={ref} className={partClass('evoker-tabs-indicator', className)} />; }),
};

export const Select = {
  Root: BaseSelect.Root,
  Value: BaseSelect.Value,
  Icon: BaseSelect.Icon,
  Trigger: forwardRef<HTMLButtonElement, BaseSelect.Trigger.Props>(function SelectTrigger({ className, ...props }, ref) { return <BaseSelect.Trigger {...props} ref={ref} className={partClass('evoker-select-trigger', className)} />; }),
  Portal: function SelectPortal({ children, ...props }: BaseSelect.Portal.Props) { return <BaseSelect.Portal {...props}><PortalTheme>{children}</PortalTheme></BaseSelect.Portal>; },
  Positioner: forwardRef<HTMLDivElement, BaseSelect.Positioner.Props>(function SelectPositioner({ className, alignItemWithTrigger = false, sideOffset = 6, ...props }, ref) { return <BaseSelect.Positioner {...props} ref={ref} sideOffset={sideOffset} alignItemWithTrigger={alignItemWithTrigger} className={partClass('evoker-popover-positioner', className)} />; }),
  Content: forwardRef<HTMLDivElement, BaseSelect.Popup.Props>(function SelectContent({ className, ...props }, ref) { return <BaseSelect.Popup {...props} ref={ref} className={partClass('evoker-select-content', className)} />; }),
  List: BaseSelect.List,
  Item: forwardRef<HTMLDivElement, BaseSelect.Item.Props>(function SelectItem({ className, ...props }, ref) { return <BaseSelect.Item {...props} ref={ref} className={partClass('evoker-select-item', className)} />; }),
  ItemText: BaseSelect.ItemText,
  ItemIndicator: BaseSelect.ItemIndicator,
  Group: BaseSelect.Group,
  GroupLabel: BaseSelect.GroupLabel,
};

const TooltipDescription = createContext<{
  defaultId: string;
  content: { id: string; present: boolean };
  setContent: React.Dispatch<React.SetStateAction<{ id: string; present: boolean }>>;
} | null>(null);
function TooltipRoot<Payload>(props: BaseTooltip.Root.Props<Payload>) {
  const defaultId = useId();
  const [content, setContent] = useState({ id: defaultId, present: false });
  const value = useMemo(() => ({ defaultId, content, setContent }), [defaultId, content]);
  return <TooltipDescription.Provider value={value}><BaseTooltip.Root {...props} /></TooltipDescription.Provider>;
}
const TooltipTrigger = forwardRef<HTMLButtonElement, BaseTooltip.Trigger.Props>(function TooltipTrigger({ 'aria-describedby': describedBy, ...props }, ref) {
  const context = useContext(TooltipDescription);
  return <BaseTooltip.Trigger {...props} ref={ref} aria-describedby={[describedBy, context?.content.present ? context.content.id : ''].filter(Boolean).join(' ') || undefined} />;
});
const TooltipContent = forwardRef<HTMLDivElement, BaseTooltip.Popup.Props>(function TooltipContent({ className, id: suppliedId, role = 'tooltip', ...props }, ref) {
  const context = useContext(TooltipDescription);
  const generated = useId();
  const id = suppliedId ?? context?.defaultId ?? generated;
  const register = context?.setContent;
  useLayoutEffect(() => {
    register?.({ id, present: true });
    return () => register?.(value => value.id === id ? { ...value, present: false } : value);
  }, [id, register]);
  return <BaseTooltip.Popup {...props} id={id} role={role} ref={ref} className={partClass('evoker-tooltip', className)} />;
});
export const Tooltip = {
  Provider: BaseTooltip.Provider,
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Portal: function TooltipPortal({ children, ...props }: BaseTooltip.Portal.Props) { return <BaseTooltip.Portal {...props}><PortalTheme>{children}</PortalTheme></BaseTooltip.Portal>; },
  Positioner: forwardRef<HTMLDivElement, BaseTooltip.Positioner.Props>(function TooltipPositioner({ className, sideOffset = 8, ...props }, ref) { return <BaseTooltip.Positioner {...props} ref={ref} sideOffset={sideOffset} className={partClass('evoker-popover-positioner', className)} />; }),
  Content: TooltipContent,
};

export const DropdownMenu = {
  Root: BaseMenu.Root,
  Trigger: BaseMenu.Trigger,
  Portal: function MenuPortal({ children, ...props }: BaseMenu.Portal.Props) { return <BaseMenu.Portal {...props}><PortalTheme>{children}</PortalTheme></BaseMenu.Portal>; },
  Positioner: forwardRef<HTMLDivElement, BaseMenu.Positioner.Props>(function MenuPositioner({ className, sideOffset = 6, ...props }, ref) { return <BaseMenu.Positioner {...props} ref={ref} sideOffset={sideOffset} className={partClass('evoker-popover-positioner', className)} />; }),
  Content: forwardRef<HTMLDivElement, BaseMenu.Popup.Props>(function MenuContent({ className, ...props }, ref) { return <BaseMenu.Popup {...props} ref={ref} className={partClass('evoker-menu-content', className)} />; }),
  Item: forwardRef<HTMLElement, BaseMenu.Item.Props>(function MenuItem({ className, ...props }, ref) { return <BaseMenu.Item {...props} ref={ref} className={partClass('evoker-menu-action', className)} />; }),
  Group: BaseMenu.Group,
  GroupLabel: BaseMenu.GroupLabel,
  Separator: BaseMenu.Separator,
};
