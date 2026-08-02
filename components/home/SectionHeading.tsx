interface Props {
  title: string;
}

export default function SectionHeading({
  title,
}: Props) {
  return (
    <h2 className="text-sm font-bold tracking-[2px] text-gray-500 mb-4">
      {title}
    </h2>
  );
}