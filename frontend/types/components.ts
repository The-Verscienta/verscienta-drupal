/**
 * Component Prop Type Definitions
 */

import { ReactNode } from 'react';

// Button Component
export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

// Input Component
export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  className?: string;
  name?: string;
  id?: string;
}

// Card Component
export interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
}

// Modal Component
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

// Toast/Notification Component
export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

// Loading Component
export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  variant?: 'spinner' | 'dots' | 'bars';
}

// Pagination Component
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
  showFirstLast?: boolean;
  className?: string;
}

// Breadcrumbs Component
export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  className?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

// Search Bar Component
export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

// Filter Panel Component
export interface FilterPanelProps {
  filters: FilterGroup[];
  selectedFilters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onReset?: () => void;
  className?: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'select';
  options?: FilterOption[];
  min?: number;
  max?: number;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

// Card Grid Components
export interface HerbCardProps {
  id: string;
  title?: string;
  scientificName?: string;
  commonNames?: string[];
  onClick?: () => void;
  className?: string;
}

export interface ModalityCardProps {
  id: string;
  name: string;
  excelsAt?: string[];
  description?: string;
  onClick?: () => void;
  className?: string;
}

export interface PractitionerCardProps {
  id: string;
  name: string;
  practiceType?: string;
  modalities?: string[];
  location?: string;
  distance?: number;
  rating?: number;
  reviewCount?: number;
  onClick?: () => void;
  className?: string;
}

// Form Components
export interface FormFieldProps {
  name: string;
  label?: string;
  type?: string;
  value?: any;
  onChange?: (value: any) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  placeholder?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  error?: string;
  label?: string;
  className?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Navigation Components
export interface NavLinkProps {
  href: string;
  children: ReactNode;
  active?: boolean;
  external?: boolean;
  className?: string;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export interface DropdownItem {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: ReactNode;
  divider?: boolean;
  disabled?: boolean;
}

// Map Component
export interface MapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  markers?: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  height?: string | number;
  className?: string;
}

export interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title?: string;
  description?: string;
  icon?: string;
}

// Rating Component
export interface RatingProps {
  value: number;
  max?: number;
  readonly?: boolean;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

// Badge Component
export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

// Alert Component
export interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: AlertAction[];
  className?: string;
}

export interface AlertAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}
