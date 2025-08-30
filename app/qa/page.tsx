import QAPageClient from "@/components/qa-page-client"
import { categories, qaData } from "@/lib/qa-data"

/**
 * Server component – fetch data (if you later pull it from DB/API)
 * and pass down to the interactive client part.
 */
export default function QAPage() {
  return <QAPageClient categories={categories} qaData={qaData} />
}
