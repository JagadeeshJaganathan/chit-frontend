type Props = {
  items: string[];
};

const Breadcrumbs = ({ items }: Props) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#7b6a56]">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="flex items-center gap-2">
          {index > 0 && <span className="text-[#c75c2a]">/</span>}
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
};

export default Breadcrumbs;
