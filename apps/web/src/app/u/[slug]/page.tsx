import { PublicProfileRoute } from '../../../components/prototype-ui';

export default function PublicProfilePage({ params }: { params: { slug: string } }): JSX.Element {
  return <PublicProfileRoute slug={params.slug} />;
}
