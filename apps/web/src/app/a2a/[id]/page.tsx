import { A2ARoute } from '../../../components/prototype-ui';

export default function A2APage({ params }: { params: { id: string } }): JSX.Element {
  return <A2ARoute sessionId={params.id} />;
}
