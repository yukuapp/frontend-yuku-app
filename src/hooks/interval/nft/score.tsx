import { useCallback, useEffect, useState } from 'react';
import { getTokenOwners, getTokenScores } from '@/utils/combined/collection';
import { isSameNft, isSameNftByTokenId } from '@/common/nft/identifier';
import { FirstRenderByData } from '@/common/react/render';
import { NftIdentifier, NftTokenScore } from '@/types/nft';
import { NftMetadata } from '@/types/nft';

export const useNftScore = (
    card: NftMetadata | undefined,
): {
    score: NftTokenScore | undefined;
    scores: NftTokenScore[] | undefined;
    refresh: () => void;
} => {
    const [score, setScore] = useState<NftTokenScore | undefined>(card?.score);
    const [scores, setScores] = useState<NftTokenScore[] | undefined>(undefined);

    const refresh = useCallback(() => {
        if (card === undefined) return;
        const collection = card.owner.token_id.collection;
        getTokenOwners(collection, 'stored_remote').then((token_owners) => {
            if (token_owners) {
                getTokenScores(collection, {
                    from: 'stored_remote',
                    token_owners,
                }).then((scores) => {
                    if (scores) {
                        const score = scores.find((s) => isSameNftByTokenId(s, card.metadata));
                        card.score = score;
                        setScore(score);
                        setScores(scores);
                    }
                });
            }
        });
    }, [card]);

    const [once_check_score] = useState(new FirstRenderByData());
    useEffect(() => {
        once_check_score.once(card && [card.owner.token_id], refresh);
    }, [card]);

    return { score, scores, refresh };
};

export const useNftScoreByNftIdentifier = (
    token_id: NftIdentifier | undefined,
): {
    score: NftTokenScore | undefined;
    scores: NftTokenScore[] | undefined;
    refresh: () => void;
} => {
    const { collection, token_identifier }: { collection?: string; token_identifier?: string } =
        token_id ? token_id : {};

    const [score, setScore] = useState<NftTokenScore | undefined>(undefined);
    const [scores, setScores] = useState<NftTokenScore[] | undefined>(undefined);

    const refresh = useCallback(() => {
        if (!collection || !token_identifier) return;
        getTokenOwners(collection, 'stored_remote').then((token_owners) => {
            if (token_owners) {
                getTokenScores(collection, {
                    from: 'stored_remote',
                    token_owners,
                }).then((scores) => {
                    const token_id = { collection, token_identifier };
                    if (scores) {
                        const score = scores.find((s) => isSameNft(s.token_id, token_id));
                        setScore(score);
                        setScores(scores);
                    }
                });
            }
        });
    }, [collection, token_identifier]);

    const [once_check_score] = useState(new FirstRenderByData());
    useEffect(() => {
        once_check_score.once([collection, token_identifier], refresh);
    }, [collection, token_identifier]);

    return { score, scores, refresh };
};
