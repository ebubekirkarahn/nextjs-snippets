import Link from 'next/link';
import { notFound } from "next/navigation";
import { db } from "@/db";
import * as actions from '@/actions';

interface SnippetShowPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SnippetShowPage(props: SnippetShowPageProps) {
  await new Promise((r) => setTimeout(r, 2000)); // we've got that arbitrary two second pause as we load up some data.

  const { id } = await props.params;

  const snippet = await db.snippet.findFirst({
    where: { id: parseInt(id) },
  });

  if (!snippet) {
    return notFound();
  }
  const deleteSnippetAction = actions.deleteSnippet.bind(null, snippet.id);

  /*
  Bu satır, `deleteSnippet` fonksiyonuna **id parametresini önceden bağlamak (bind)** için yazılmış.

**Neden `bind` kullanılıyor?**

1. **Server Actions form kullanımı**: Next.js'te server action'ları bir `<form>`'un `action` prop'una verirken, fonksiyon **parametre almadan** çağrılmalıdır.

2. **ID'yi önceden sabitleme**: `bind(null, snippet.id)` ile yeni bir fonksiyon oluşturuluyor ve `snippet.id` ilk parametre olarak sabitleniyor.

**Örnek:**
```tsx
// ❌ Bu çalışmaz - action prop parametre beklemez
<form action={actions.deleteSnippet(snippet.id)}>

// ✅ Bu çalışır - bind ile parametresiz fonksiyon oluşturulur
const deleteSnippetAction = actions.deleteSnippet.bind(null, snippet.id);
<form action={deleteSnippetAction}>
```

**Alternatif yöntem:**
```tsx
// Wrapper fonksiyon kullanarak
<form action={() => actions.deleteSnippet(snippet.id)}>
```

Ancak Next.js Server Actions ile form kullanımında `bind` yöntemi daha yaygın ve önerilen yaklaşımdır çünkü direkt olarak server action referansını korur.

Next.js Server Actions, özel olarak işaretlenmiş ('use server') fonksiyonlardır. Next.js bu fonksiyonları özel bir şekilde işler:

bind kullandığında:

✅ Next.js hala bunun bir server action olduğunu biliyor
✅ Otomatik olarak form submit'i server'a gönderir
✅ JavaScript olmadan bile çalışır (progressive enhancement)
Arrow function kullanırsanız:

❌ Next.js bunu normal bir client-side fonksiyon olarak görür
❌ Tarayıcıda JavaScript gerektirir
❌ Server action özelliklerini kaybeder
Özet: bind kullanmak, fonksiyonun "ben bir server action'ım" kimliğini korur. Arrow function ise yeni bir client fonksiyon yaratır ve server action özelliğini bozar.

*/
  return (
    <div>
      <div className="flex m-4 justify-between items-center">
        <h1 className="text-xl font-bold">{snippet.title}</h1>
        <div className="flex gap-4">
          <Link
            href={`/snippets/${snippet.id}/edit`}
            className="p-2 border rounded"
          >
            Edit
          </Link>
          <form action={deleteSnippetAction}>
            <button className="p-2 border rounded">Delete</button>
          </form>
        </div>
      </div>
      <pre className="p-3 border rounded bg-gray-200 border-gray-200">
        <code>{snippet.code}</code>
      </pre>
    </div>
  );
}
