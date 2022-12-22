import * as React from 'react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { hot } from 'react-hot-loader';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import useGlobalSubscriptions from './common/hooks/useGlobalSubscriptions';
import useAssetsStore from './store/assetsStore/useAssetsStore';
import useAuthStore from './store/authStore/useAuthStore';
import { StellarService } from './common/services/globalServices';
import Header, { HeaderNavLink } from './common/components/Header/Header';
import { MainRoutes } from './routes';
import PageLoader from './common/basics/PageLoader';
import NotFoundPage from './common/components/NotFoundPage/NotFoundPage';
import { Breakpoints, COLORS } from './common/styles';
import ToastContainer from './common/toasts/ToastContainer';
import { respondDown } from './common/mixins';
import Provider from './store';
import ModalContainer from './common/modals/atoms/ModalContainer';
import Footer from './common/components/Footer/Footer';
import { createGlobalStyle } from 'styled-components';
import AppGlobalStyle from './common/components/AppGlobalStyles';
import Governance from './pages/governance/Governance';
import Title from 'react-document-title';

const MainPage = lazy(() => import('./pages/main/MainPage'));
const LockerPage = lazy(() => import('./pages/locker/Locker'));
const VotePage = lazy(() => import('./pages/vote/Vote'));
const BribesPage = lazy(() => import('./pages/bribes/Bribes'));
const MarketPage = lazy(() => import('./pages/market/Market'));
const RewardsPage = lazy(() => import('./pages/rewards/Rewards'));
const AirdropPage = lazy(() => import('./pages/airdrop/Airdrop'));
const Airdrop2Page = lazy(() => import('./pages/airdrop2/Airdrop2'));

const UPDATE_ASSETS_DATE = 'update assets timestamp';
const UPDATE_PERIOD = 24 * 60 * 60 * 1000;

const App = () => {
    useGlobalSubscriptions();

    const { getAssets, assets, processNewAssets, assetsInfo, clearAssets } = useAssetsStore();
    const [isAssetsUpdated, setIsAssetsUpdated] = useState(false);

    const { isLogged, account } = useAuthStore();

    useEffect(() => {
        const assetUpdateTimestamp = localStorage.getItem(UPDATE_ASSETS_DATE);

        if (!assetUpdateTimestamp || Date.now() - Number(assetUpdateTimestamp) > UPDATE_PERIOD) {
            clearAssets();
            localStorage.setItem(UPDATE_ASSETS_DATE, Date.now().toString());
            setIsAssetsUpdated(true);
        } else {
            setIsAssetsUpdated(true);
        }

        getAssets();
    }, []);

    useEffect(() => {
        if (assets.length) {
            processNewAssets(assets);
        }
    }, [assets]);

    useEffect(() => {
        if (isLogged) {
            StellarService.startClaimableBalancesStream(account.accountId());
        } else {
            StellarService.closeClaimableBalancesStream();
        }
    }, [isLogged]);

    if (!isAssetsUpdated || !assetsInfo.size) {
        return <PageLoader />;
    }

    return (
        <Router>
            <Header>
                <>
                    <HeaderNavLink
                        to={MainRoutes.vote}
                        exact
                        activeStyle={{
                            fontWeight: 700,
                        }}
                        title="Voting"
                    >
                        Voting
                    </HeaderNavLink>
                    <HeaderNavLink
                        to={MainRoutes.rewards}
                        activeStyle={{
                            fontWeight: 700,
                        }}
                        title="Rewards"
                    >
                        Rewards
                    </HeaderNavLink>
                    <HeaderNavLink
                        to={MainRoutes.bribes}
                        activeStyle={{
                            fontWeight: 700,
                        }}
                        title="Bribes"
                    >
                        Bribes
                    </HeaderNavLink>
                    <HeaderNavLink
                        to={MainRoutes.locker}
                        activeStyle={{
                            fontWeight: 700,
                        }}
                        title="Locker"
                    >
                        Locker
                    </HeaderNavLink>
                    <HeaderNavLink
                        to={MainRoutes.governance}
                        activeStyle={{
                            fontWeight: 700,
                        }}
                        title="Governance"
                    >
                        Governance
                    </HeaderNavLink>
                    <HeaderNavLink
                        to={MainRoutes.airdrop2}
                        activeStyle={{
                            fontWeight: 700,
                        }}
                        title="Airdrop"
                    >
                        Airdrop
                    </HeaderNavLink>
                </>
            </Header>
            <Suspense fallback={<PageLoader />}>
                <Switch>
                    <Route exact path={MainRoutes.main}>
                        <Title title="Liquidity management layer for Stellar | Aquarius">
                            <MainPage />
                        </Title>
                    </Route>
                    <Route path={MainRoutes.locker}>
                        <Title title="Aquarius Locker">
                            <LockerPage />
                        </Title>
                    </Route>
                    <Route path={MainRoutes.governance}>
                        <Title title="Aquarius Governance">
                            <Governance />
                        </Title>
                    </Route>
                    <Route path={MainRoutes.vote}>
                        <Title title="Aquarius Voting Tool">
                            <VotePage />
                        </Title>
                    </Route>
                    <Route path={MainRoutes.bribes}>
                        <Title title="Aquarius Bribes">
                            <BribesPage />
                        </Title>
                    </Route>
                    <Route path={MainRoutes.market}>
                        <MarketPage />
                    </Route>
                    <Route path={MainRoutes.rewards}>
                        <Title title="Aquarius Rewards">
                            <RewardsPage />
                        </Title>
                    </Route>
                    <Route path={MainRoutes.airdrop}>
                        <Title title="Aquarius Airdrop">
                            <AirdropPage />
                        </Title>
                    </Route>
                    <Route path={MainRoutes.airdrop2}>
                        <Title title="Aquarius Airdrop #2">
                            <Airdrop2Page />
                        </Title>
                    </Route>

                    <Route component={NotFoundPage} />
                </Switch>
            </Suspense>
            <Footer />

            <ModalContainer />
            <ToastContainer />
        </Router>
    );
};

const BodyStyle = createGlobalStyle`
    ${respondDown(Breakpoints.md)`
        body {
            background-color: ${COLORS.lightGray};
        } 
    `}
`;

const ProvidedApp = () => {
    return (
        <Provider>
            <AppGlobalStyle />
            <BodyStyle />
            <App />
        </Provider>
    );
};

declare let module: Record<string, unknown>;

export default hot(module)(ProvidedApp);
