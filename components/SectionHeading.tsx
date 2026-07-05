interface Props {
  title: string;
}

export default function SectionHeading({
  title,
}: Props) {
  return (
    <h2 className="mb-5 text-xs font-bold uppercase tracking-[3px] text-gray-500">
      {title}
    </h2>
  );
}