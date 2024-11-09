import CardsReciters from "./CardsReciters";

interface Reciter {
  id: number;
  title: string;
  add_date: number;
  recitations_info?: {
    count: number;
    recitations_ids: number[];
  };
}

export default async function FamousReciters() {
  const response = await fetch(
    "https://api3.islamhouse.com/v3/paV29H2gm56kvLPy/quran/get-category/364794/ar/json"
  );
  const res = await response.json();

  const reciters = res.authors.filter((author: Reciter) =>
    [135998, 167521, 8326, 8474, 86335, 111670, 111542, 151567].includes(author.id)
  );

  if (!reciters || reciters.length === 0) {
    return <p>لا يوجد قراء لعرضهم حاليًا.</p>;
  }

  const recitersWithUniqueRecitations = reciters.map((reciter:Reciter) => {
    const uniqueRecitationsIds = Array.from(new Set(reciter.recitations_info?.recitations_ids || []));
    return {
      id: reciter.id,
      title: reciter.title,
      recitations_ids: uniqueRecitationsIds, // تمرير recitations_ids الفريدة
    };
  });
  return (
    <div className="space-y-4">
      <CardsReciters
        reciters={recitersWithUniqueRecitations}
      />
    </div>
  );
}
