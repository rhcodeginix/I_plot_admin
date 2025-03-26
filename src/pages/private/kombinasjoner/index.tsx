import { KombinasjonerTable } from "./kombinasjonerTable";

export const Kombinasjoner = () => {
  return (
    <>
      <div className="px-6 pt-6 pb-16 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-darkBlack font-medium text-[30px]">
              Antall kombinasjoner (tomt+hus)
            </h1>
            <p className="text-gray">
              Liste over alle Antall kombinasjoner (tomt+hus)
            </p>
          </div>
        </div>
        <KombinasjonerTable />
      </div>
    </>
  );
};
