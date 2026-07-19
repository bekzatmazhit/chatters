import { Home, ChevronRight } from 'lucide-react';

export default function Breadcrumb({ crumbs }) {
  return (
    <div className="flex items-center gap-1.5 text-[13px] text-gray-400">
      <Home size={13} className="text-gray-400" />
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight size={12} className="text-gray-300" />
          <span className={i === crumbs.length - 1 ? 'text-gray-700 font-medium' : 'hover:text-gray-600 cursor-pointer'}>
            {crumb}
          </span>
        </span>
      ))}
    </div>
  );
}
