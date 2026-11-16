export const BloodBadge = ({ type = 'O-', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs rounded-md',
    md: 'w-10 h-10 text-sm font-bold rounded-lg',
    lg: 'w-14 h-14 text-xl font-bold rounded-xl',
    xl: 'w-20 h-20 text-3xl font-extrabold rounded-2xl',
  };

  return (
    <div
      className={`bg-[#B81D24] text-white flex items-center justify-center font-semibold tracking-tight shadow-sm shrink-0 select-none ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {type}
    </div>
  );
};

export default BloodBadge;
