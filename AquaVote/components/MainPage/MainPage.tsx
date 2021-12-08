import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import BackgroundImageLeft from '../../../common/assets/img/background-left.svg';
import BackgroundImageRight from '../../../common/assets/img/background-right.svg';
import { Breakpoints, COLORS } from '../../../common/styles';
import {
    commonMaxWidth,
    flexAllCenter,
    flexRowSpaceBetween,
    respondDown,
} from '../../../common/mixins';
import ToggleGroup from '../../../common/basics/ToggleGroup';
import Table from './Table/Table';
import FloatingButton from './FloatingButton/FloatingButton';
import SelectedPairsForm from './SelectedPairsForm/SelectedPairsForm';
import { ModalService, StellarService } from '../../../common/services/globalServices';
import ChooseLoginMethodModal from '../../../common/modals/ChooseLoginMethodModal';
import useAuthStore from '../../../common/store/authStore/useAuthStore';
import AssetDropdown from '../AssetDropdown/AssetDropdown';
import Arrows from '../../../common/assets/img/icon-arrows-circle.svg';
import {
    getFilteredPairsList,
    getPairsList,
    getTotalVotingStats,
    getUserPairsList,
    SortTypes,
    updateVotesForMarketKeys,
} from '../../api/api';
import PageLoader from '../../../common/basics/PageLoader';
import useAssetsStore from '../../store/assetsStore/useAssetsStore';
import Tooltip, { TOOLTIP_POSITION } from '../../../common/basics/Tooltip';
import { PairStats } from '../../api/types';
import CreatePairModal from './CreatePairModal/CreatePairModal';
import Pair from '../common/Pair';
import Button from '../../../common/basics/Button';
import { formatBalance, getTimeAgoValue } from '../../../common/helpers/helpers';
import { Option } from '../../../common/basics/Select';
import Pagination from '../../../common/basics/Pagination';
import { StellarEvents } from '../../../common/services/stellar.service';
import DotsLoader from '../../../common/basics/DotsLoader';
import { useHistory, useLocation } from 'react-router-dom';

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

const Background = styled.div`
    padding: 10% 0;
    ${flexAllCenter};
    flex-direction: column;
    background-color: ${COLORS.darkPurple};
    min-height: 10rem;
    max-height: 40vh;
    overflow: hidden;
    position: relative;
`;

const BackgroundLeft = styled(BackgroundImageLeft)`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
`;

const BackgroundRight = styled(BackgroundImageRight)`
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
`;

const Title = styled.h2`
    font-size: 8rem;
    line-height: 9.4rem;
    font-weight: bold;
    color: ${COLORS.white};
    z-index: 1;
    margin-bottom: 1.6rem;
    text-align: center;

    ${respondDown(Breakpoints.lg)`
      font-size: 7rem;
      line-height: 8rem;
      margin-bottom: 1.2rem;
    `}

    ${respondDown(Breakpoints.md)`
        font-size: 5.5rem;
        line-height: 6rem;
        margin-bottom: 1rem;
    `}
    
    ${respondDown(Breakpoints.sm)`
        font-size: 4rem;
        line-height: 5rem;
        margin-bottom: 0.8rem;
    `}
`;

const Description = styled.div`
    max-width: 79.2rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.white};
    text-align: center;
    opacity: 0.7;
    z-index: 1;
`;

const ExploreBlock = styled.div<{ hasChosenPairs: boolean }>`
    position: relative;
    padding: 0 4rem;
    ${commonMaxWidth};
    padding-bottom: ${({ hasChosenPairs }) => (hasChosenPairs ? '0' : '6.6rem')};
`;

const PairSearch = styled.div`
    margin-top: -5.5rem;
    height: 17rem;
    background: #ffffff;
    box-shadow: 0 20px 30px rgba(0, 6, 54, 0.06);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4.8rem;
    box-sizing: border-box;
`;

const ArrowsIcon = styled(Arrows)`
    margin: 0 3.6rem;
    min-width: 1.6rem;
`;

const TooltipFullWidth = styled(Tooltip)`
    width: 100%;
`;

const TooltipContent = styled.div`
    display: flex;
    ${flexAllCenter};
    width: 30rem;
    white-space: pre-wrap;
    font-size: 1.6rem;
    line-height: 2.4rem;
    padding: 0.8rem;

    span:first-child {
        margin-right: 1.2rem;
    }
`;

const Header = styled.header`
    display: flex;
    //justify-content: space-between;
    align-items: center;
    margin: 5.4rem 0;
`;

const TitleHeader = styled.h3`
    font-weight: bold;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.titleText};
    margin-right: 3.6rem;
`;

const StatusUpdate = styled.div`
    margin-left: auto;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    white-space: nowrap;
`;

const SearchEnabled = styled.div`
    font-size: 3.6rem;
    line-height: 4.2rem;
    margin-bottom: 3.2rem;
`;

const CreatePair = styled.div`
    ${flexRowSpaceBetween};
    height: 9.6rem;
    margin-bottom: 6rem;
`;

const BeFirst = styled.div`
    font-weight: bold;
    font-size: 1.2rem;
    line-height: 1.4rem;
    display: flex;
    align-items: center;
    width: 16rem;
    white-space: pre-line;

    div:first-child {
        margin-right: 0.8rem;
    }
`;

export const SELECTED_PAIRS_ALIAS = 'selected pairs';

const getCachedChosenPairs = () => JSON.parse(localStorage.getItem(SELECTED_PAIRS_ALIAS) || '[]');

const options: Option<SortTypes>[] = [
    { label: 'Popular', value: SortTypes.popular },
    { label: 'Top Voted', value: SortTypes.topVoted },
    { label: 'Your Votes', value: SortTypes.yourVotes },
];

const PAGE_SIZE = 20;
const UPDATE_INTERVAL = 60 * 1000; // 1 minute

enum UrlParams {
    sort = 'sort',
    base = 'base',
    counter = 'counter',
}

const assetToUrlParams = (asset) => {
    const assetInstance = StellarService.createAsset(asset.code, asset.issuer);

    if (assetInstance.isNative()) {
        return 'native';
    }

    return `${assetInstance.code}:${assetInstance.issuer}`;
};

const assetFromUrlParams = (params) => {
    if (params === 'native') {
        return StellarService.createLumen();
    }

    const [code, issuer] = params.split(':');

    return StellarService.createAsset(code, issuer);
};

const MainPage = (): JSX.Element => {
    const [updateIndex, setUpdateIndex] = useState(0);
    const { processNewAssets } = useAssetsStore();
    const [chosenPairs, setChosenPairs] = useState(getCachedChosenPairs());
    const [sort, setSort] = useState(null);
    const [page, setPage] = useState(1);
    const { isLogged, account } = useAuthStore();
    const [isClaimableBalancesLoaded, setIsClaimableBalancesLoaded] = useState(false);
    const [searchBase, setSearchBase] = useState(null);
    const [searchCounter, setSearchCounter] = useState(null);
    const [pairsLoading, setPairsLoading] = useState(false);
    const [changePageLoading, setChangePageLoading] = useState(false);
    const [isCounterSearchActive, setIsCounterSearchActive] = useState(false);
    const [totalStats, setTotalStats] = useState(null);

    const [pairs, setPairs] = useState(null);
    const [count, setCount] = useState(0);

    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (
            !params.has(UrlParams.sort) &&
            !params.has(UrlParams.base) &&
            !params.has(UrlParams.counter)
        ) {
            params.append(UrlParams.sort, SortTypes.popular);
            history.replace({ search: params.toString() });
            return;
        }
        if (
            params.has(UrlParams.sort) &&
            (params.has(UrlParams.base) || params.has(UrlParams.counter))
        ) {
            params.delete(UrlParams.base);
            params.delete(UrlParams.counter);
            history.replace({ search: params.toString() });
            return;
        }

        if (params.has(UrlParams.counter) && !params.has(UrlParams.base)) {
            params.append(UrlParams.base, params.get(UrlParams.counter));
            params.delete(UrlParams.counter);
            history.replace({ search: params.toString() });
        }

        if (
            params.get(UrlParams.base) &&
            params.get(UrlParams.base) === params.get(UrlParams.counter)
        ) {
            params.delete(UrlParams.counter);
            history.replace({ search: params.toString() });
            return;
        }

        if (
            params.has(UrlParams.sort) &&
            !Object.values(SortTypes).includes(params.get(UrlParams.sort) as SortTypes)
        ) {
            params.delete(UrlParams.sort);
            history.replace({ search: params.toString() });
            return;
        }

        if (params.has(UrlParams.sort)) {
            setSort(params.get(UrlParams.sort));
        } else {
            setSort(null);
        }
        if (params.has(UrlParams.base)) {
            try {
                const asset = assetFromUrlParams(params.get(UrlParams.base));
                setSearchBase(asset);
            } catch (e) {
                params.delete(UrlParams.base);
                history.replace({ search: params.toString() });
            }
        } else {
            setSearchBase(null);
        }
        if (params.has(UrlParams.counter)) {
            try {
                const asset = assetFromUrlParams(params.get(UrlParams.counter));
                setSearchCounter(asset);
            } catch (e) {
                params.delete(UrlParams.counter);
                history.replace({ search: params.toString() });
            }
        } else {
            setSearchCounter(null);
        }
    }, [location]);

    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateIndex((prev) => prev + 1);
        }, UPDATE_INTERVAL);

        return () => {
            clearInterval(interval);
        };
    }, [sort, searchBase, searchCounter, page]);

    useEffect(() => {
        getTotalVotingStats().then((result) => {
            setTotalStats(result);
        });
    }, [UPDATE_INTERVAL]);

    useEffect(() => {
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setIsClaimableBalancesLoaded(StellarService.isClaimableBalancesLoaded);
            }
        });

        return () => unsub();
    }, []);

    const updateChosenPairs = () => {
        setChosenPairs(getCachedChosenPairs());
    };

    const startVote = () => {
        if (isLogged) {
            ModalService.openModal(SelectedPairsForm, {
                pairs: chosenPairs,
                updatePairs: updateChosenPairs,
            }).then(() => {
                setChosenPairs(getCachedChosenPairs());
            });
            return;
        }
        ModalService.openModal(ChooseLoginMethodModal, {});
    };

    const processAssetsFromPairs = (pairs) => {
        const assets = pairs.reduce((acc, item) => {
            return [
                ...acc,
                { code: item.asset1_code, issuer: item.asset1_issuer },
                { code: item.asset2_code, issuer: item.asset2_issuer },
            ];
        }, []);

        processNewAssets(assets);
    };

    useEffect(() => {
        if (sort === SortTypes.yourVotes && !isLogged) {
            changeSort(SortTypes.popular);
        }
    }, [isLogged]);

    useEffect(() => {
        if (sort === SortTypes.yourVotes && !isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {});
        }
    }, [sort]);

    useEffect(() => {
        if (sort !== SortTypes.yourVotes) {
            return;
        }
        setPairsLoading(true);

        if (isClaimableBalancesLoaded) {
            const keys = StellarService.getKeysSimilarToMarketKeys(account.accountId());

            getUserPairsList(keys).then((result) => {
                setPairs(result);
                processAssetsFromPairs(result);
                setCount(result.length);
                setPairsLoading(false);
                setChangePageLoading(false);
            });
        }
    }, [sort, isClaimableBalancesLoaded]);

    useEffect(() => {
        if (sort === SortTypes.topVoted) {
            getPairsList(sort, PAGE_SIZE, page).then((result) => {
                setPairs(result.pairs);
                setCount(result.count);
                processAssetsFromPairs(result.pairs);
            });
            return;
        }
        updateVotesForMarketKeys(pairs).then((result) => {
            setPairs(result);
        });
    }, [updateIndex]);

    useEffect(() => {
        if (!sort || sort === SortTypes.yourVotes) {
            return;
        }

        setPairsLoading(true);
        getPairsList(sort, PAGE_SIZE, page).then((result) => {
            setPairs(result.pairs);
            setCount(result.count);
            processAssetsFromPairs(result.pairs);
            setPairsLoading(false);
            setChangePageLoading(false);
        });
    }, [sort, page]);

    useEffect(() => {
        if (!searchBase) {
            return;
        }
        setPairsLoading(true);
        getFilteredPairsList(searchBase, searchCounter, PAGE_SIZE, page).then((result) => {
            setPairs(result.pairs);
            processAssetsFromPairs(result.pairs);
            setCount(result.count);
            setPairsLoading(false);
            setChangePageLoading(false);
        });
    }, [searchBase, searchCounter, page]);

    const changeSort = (sortValue) => {
        const params = new URLSearchParams(location.search);
        params.set(UrlParams.sort, sortValue);
        params.delete(UrlParams.base);
        params.delete(UrlParams.counter);
        history.push({ pathname: location.pathname, search: params.toString() });
        setPage(1);
    };

    const changeBaseSearch = (asset) => {
        const params = new URLSearchParams(location.search);
        params.delete(UrlParams.sort);
        if (asset) {
            params.set(UrlParams.base, assetToUrlParams(asset));
        } else {
            params.delete(UrlParams.base);
        }
        history.push({
            pathname: location.pathname,
            search: decodeURIComponent(params.toString()),
        });
        setPairsLoading(true);
        setPage(1);
    };

    const changeCounterSearch = (asset) => {
        const params = new URLSearchParams(location.search);
        params.delete(UrlParams.sort);
        if (asset) {
            params.set(UrlParams.counter, assetToUrlParams(asset));
        } else {
            params.delete(UrlParams.counter);
        }
        history.push({
            pathname: location.pathname,
            search: decodeURIComponent(params.toString()),
        });
        setPairsLoading(true);
        setPage(1);
    };

    const changePage = (page) => {
        setPage(page);
        setChangePageLoading(true);
    };

    if (!pairs) {
        return <PageLoader />;
    }
    const createPair = () => {
        if (isLogged) {
            ModalService.openModal(CreatePairModal, {
                base: searchBase,
                counter: searchCounter,
            });
            return;
        }
        ModalService.openModal(ChooseLoginMethodModal, {});
    };
    const onVoteClick = (pair: PairStats) => {
        const isPairSelected = chosenPairs.some(
            (chosenPair) => chosenPair.market_key === pair.market_key,
        );

        let updatedPairs;

        if (isPairSelected) {
            updatedPairs = chosenPairs.filter(
                (chosenPair) => chosenPair.market_key !== pair.market_key,
            );
        } else {
            updatedPairs = [...chosenPairs, pair];
        }
        setChosenPairs(updatedPairs);
        localStorage.setItem(SELECTED_PAIRS_ALIAS, JSON.stringify(updatedPairs));
    };

    const hasChosenPairs = chosenPairs.length > 0;

    return (
        <MainBlock>
            <Background>
                <Title>Vote For Your Favorite Pairs</Title>
                <Description>
                    Lock your AQUA to create immutable and transparent votes direct on the Stellar
                    blockchain
                </Description>
                <BackgroundLeft />
                <BackgroundRight />
            </Background>
            <ExploreBlock hasChosenPairs={hasChosenPairs}>
                <PairSearch>
                    <AssetDropdown
                        asset={searchBase}
                        onUpdate={changeBaseSearch}
                        exclude={searchCounter}
                    />
                    <ArrowsIcon />
                    <TooltipFullWidth
                        content={
                            <TooltipContent>
                                <span>&#128075;</span>
                                <span>
                                    Can&apos;t find your pair below? Try to type second asset into
                                    this field
                                </span>
                            </TooltipContent>
                        }
                        position={TOOLTIP_POSITION.bottom}
                        isShow={
                            Boolean(searchBase) && !Boolean(searchCounter) && !isCounterSearchActive
                        }
                    >
                        <AssetDropdown
                            asset={searchCounter}
                            onUpdate={changeCounterSearch}
                            disabled={!searchBase}
                            onToggle={setIsCounterSearchActive}
                            exclude={searchBase}
                        />
                    </TooltipFullWidth>
                </PairSearch>
                <Header>
                    <TitleHeader>Explore</TitleHeader>
                    <ToggleGroup
                        value={sort}
                        onChange={(option) => changeSort(option)}
                        options={options}
                    />
                    {Boolean(pairs.length && pairs.some((pair) => Boolean(pair.timestamp))) && (
                        <StatusUpdate>
                            {totalStats ? (
                                `${formatBalance(
                                    totalStats.votes_value_sum,
                                    true,
                                )} AQUA total in votes · `
                            ) : (
                                <DotsLoader />
                            )}
                            Last updated{' '}
                            {getTimeAgoValue(
                                pairs.find((pair) => Boolean(pair.timestamp)).timestamp,
                            )}
                        </StatusUpdate>
                    )}
                </Header>
                {!pairsLoading && searchBase && !searchCounter && (
                    <SearchEnabled>
                        {pairs.length ? 'Search results' : 'No pairs found'}
                    </SearchEnabled>
                )}
                {sort === SortTypes.yourVotes && !pairs.length && (
                    <SearchEnabled>No pairs found</SearchEnabled>
                )}
                {searchBase && searchCounter && !pairs.length && (
                    <CreatePair>
                        <Pair base={searchBase} counter={searchCounter} />
                        <Tooltip
                            content={
                                <BeFirst>
                                    <div>&#128293;</div>
                                    <div>Be the first to vote for rewards on this pair!</div>
                                </BeFirst>
                            }
                            position={TOOLTIP_POSITION.bottom}
                            isShow={true}
                        >
                            <Button onClick={() => createPair()}>create pair</Button>
                        </Tooltip>
                    </CreatePair>
                )}
                <Table
                    pairs={pairs}
                    selectedPairs={chosenPairs}
                    selectPair={onVoteClick}
                    loading={pairsLoading}
                />
                {(!pairsLoading || changePageLoading) && sort !== SortTypes.yourVotes && (
                    <Pagination
                        pageSize={PAGE_SIZE}
                        totalCount={count}
                        onPageChange={(page) => changePage(page)}
                        currentPage={page}
                        itemName="pairs"
                    />
                )}
                {hasChosenPairs && (
                    <FloatingButton onClick={() => startVote()}>
                        {chosenPairs.length}
                    </FloatingButton>
                )}
            </ExploreBlock>
        </MainBlock>
    );
};

export default MainPage;
