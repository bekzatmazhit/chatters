import { ModelIcon } from '@/components/ui/ModelIcon';

export default function AILogo({ model, className = "w-4 h-4 object-contain rounded-sm" }) {
  // ModelIcon manages its own fallback and size, but we pass className for compatibility
  // If it needs specific sizing, we extract it from className manually, but ModelIcon uses className too.
  return <ModelIcon model={model} className={className} />;
}