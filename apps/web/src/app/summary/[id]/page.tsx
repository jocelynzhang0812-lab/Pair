import { SummaryRoute } from '../../../components/prototype-ui';

export default function SummaryPage({ params }: { params: { id: string } }): JSX.Element {
  return <SummaryRoute summaryId={params.id} />;
}
