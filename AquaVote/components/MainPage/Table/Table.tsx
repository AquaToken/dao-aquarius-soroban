import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';
import { PairStats, TotalStats } from '../../../api/types';
import { formatBalance, roundToPrecision } from '../../../../common/helpers/helpers';
import Pair from '../../common/Pair';
import PageLoader from '../../../../common/basics/PageLoader';
import { flexAllCenter } from '../../../../common/mixins';
import VoteButton from './VoteButton/VoteButton';

const TableBlock = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
`;

const TableLoader = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 10;
    ${flexAllCenter};
    animation: showLoader 0.1s ease-in-out;

    @keyframes showLoader {
        0% {
            background-color: rgba(255, 255, 255, 0);
        }
        100% {
            background-color: rgba(255, 255, 255, 0.8);
        }
    }
`;
const TableHead = styled.div`
    display: flex;
    width: 100%;
`;
const TableHeadRow = styled.div`
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: 5.2rem;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    white-space: nowrap;
`;

const TableCell = styled.div`
    display: flex;
    align-items: center;
    flex: 2 0 0;
    min-width: 14rem;
    max-width: 100%;
    &:first-child {
        flex: 4;
        min-width: 48rem;
    }
    &:nth-child(2) {
        flex: 1;
        min-width: 10rem;
    }
    &:last-child {
        flex: 1;
        justify-content: flex-end;
        min-width: 17rem;
    }
`;

const TableBody = styled.div`
    display: flex;
    flex-direction: column;
`;

const TableBodyRow = styled.div`
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: 9.6rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};

    ${TableCell}:nth-child(2) {
        font-size: 1.4rem;
        line-height: 2rem;
        color: ${COLORS.grayText};
    }
`;

// const SortingHeader = styled.button`
//     background: none;
//     border: none;
//     cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
//     padding: 0;
//     margin: 0;
//     width: 100%;
//     height: 100%;
//     color: inherit;
//
//     display: flex;
//     align-items: center;
//     justify-content: ${({ position }: { position?: string }) => {
//         if (position === 'right') return 'flex-end';
//         if (position === 'left') return 'flex-start';
//         return 'center';
//     }};
//
//     & > svg {
//         margin-left: 0.4rem;
//     }
//     &:hover {
//         color: ${COLORS.purple};
//     }
// `;

const getPercent = (value: string, total: string): string => {
    return roundToPrecision((Number(value) / Number(total)) * 100, 2);
};

const MIN_REWARDS_PERCENT = 1;

const isRewardsOn = (value: string, total: string): boolean => {
    const percent = (Number(value) / Number(total)) * 100;

    return percent >= MIN_REWARDS_PERCENT;
};

const Table = ({
    pairs,
    selectedPairs,
    selectPair,
    loading,
    totalStats,
}: {
    pairs: PairStats[];
    selectedPairs: PairStats[];
    selectPair: (PairStats) => void;
    loading: boolean;
    totalStats: TotalStats;
}): JSX.Element => {
    if (!pairs.length) {
        return null;
    }

    const isPairSelected = ({ market_key: marketKey }: PairStats): boolean => {
        return selectedPairs.some((pair) => pair.market_key === marketKey);
    };
    return (
        <TableBlock>
            {(loading || !totalStats) && (
                <TableLoader>
                    <PageLoader />
                </TableLoader>
            )}

            <TableHead>
                <TableHeadRow>
                    <TableCell>Pair</TableCell>
                    <TableCell>Users Voted</TableCell>
                    <TableCell>AQUA Voted</TableCell>
                    <TableCell>Your Vote</TableCell>
                </TableHeadRow>
            </TableHead>
            <TableBody>
                {pairs.map((pair) => {
                    return (
                        <TableBodyRow key={pair.id}>
                            <TableCell>
                                <Pair
                                    base={{ code: pair.asset1_code, issuer: pair.asset1_issuer }}
                                    counter={{ code: pair.asset2_code, issuer: pair.asset2_issuer }}
                                    isRewardsOn={isRewardsOn(
                                        pair.votes_value,
                                        totalStats.votes_value_sum,
                                    )}
                                />
                            </TableCell>
                            <TableCell>
                                {pair.voting_amount ? formatBalance(pair.voting_amount) : null}
                            </TableCell>
                            <TableCell>
                                {pair.votes_value
                                    ? `${formatBalance(+pair.votes_value, true)} AQUA (${getPercent(
                                          pair.votes_value,
                                          totalStats.votes_value_sum,
                                      )}%)`
                                    : null}{' '}
                            </TableCell>
                            <TableCell>
                                <VoteButton
                                    marketKey={pair.market_key}
                                    isPairSelected={isPairSelected(pair)}
                                    onButtonClick={() => selectPair(pair)}
                                />
                            </TableCell>
                        </TableBodyRow>
                    );
                })}
            </TableBody>
        </TableBlock>
    );
};

export default Table;
