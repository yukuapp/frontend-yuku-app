import { useArtists } from '@/hooks/views/artist';
import ExploreArtApply from './apply';
import ExploreArtCreating from './creating';

function ExploreArtCreatingMain() {
    const { artist } = useArtists();
    return <>{artist ? <ExploreArtCreating /> : <ExploreArtApply />}</>;
}

export default ExploreArtCreatingMain;
