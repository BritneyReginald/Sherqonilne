import { useRecycleBin } from "@/app/contexts/recycle-bin-context";

export function RecycleBin() {

   const { items } = useRecycleBin();

   return (
      <div className="p-6">
         <h1>Recycle Bin</h1>

         {items.map(item => (
            <div
               key={item.id}
               className="border p-4 mb-3"
            >
               <h3>{item.name}</h3>

               <p>{item.type}</p>

               <p>{item.deletedAt}</p>
            </div>
         ))}
      </div>
   );
}