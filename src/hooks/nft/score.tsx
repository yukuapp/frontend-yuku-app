import { useEffect, useState } from 'react';
import { getTokenOwners, getTokenScores } from '@/utils/combined/collection';
import { isSame } from '@/common/data/same';
import { isSameNftByTokenId } from '@/common/nft/identifier';
import { NftMetadata, NftTokenScore } from '@/types/nft';

export const useNftScore = (
    card: NftMetadata,
    updateItem?: (card: NftMetadata) => void,
): NftTokenScore | undefined => {
    const [score, setScore] = useState<NftTokenScore | undefined>(card.score);
    useEffect(() => {
        if (card.score !== undefined && isSame(score, card.score)) setScore(card.score);
    }, [card, score]);

    const setScoreAndUpdate = (score: NftTokenScore) => {
        if (isSame(card.score, score)) return;
        setScore(score);
        card.score = score;
        updateItem && updateItem(card);
    };

    useEffect(() => {
        if (score !== undefined) return;
        getTokenOwners(card.metadata.token_id.collection, 'stored_remote').then((token_owners) => {
            if (token_owners) {
                getTokenScores(card.metadata.token_id.collection, {
                    from: 'stored_remote',
                    token_owners,
                }).then((scores) => {
                    if (scores) {
                        const score = scores.find((s) => isSameNftByTokenId(s, card.metadata));
                        if (score) setScoreAndUpdate(score);
                    }
                });
            }
        });
    }, [card, score]);

    return score;
};
