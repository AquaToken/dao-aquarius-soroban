import * as React from 'react';
import styled from 'styled-components';
import AccountInfo from './AccountInfo/AccountInfo';
import { commonMaxWidth, flexAllCenter, respondDown } from '../../common/mixins';
import { Breakpoints, COLORS } from '../../common/styles';
import ToggleGroup from '../../common/basics/ToggleGroup';
import { useState } from 'react';
import YourVotes from './YourVotes/YourVotes';
import Select from '../../common/basics/Select';
import AmmRewards from './AmmRewards/AmmRewards';
import SdexRewards from './SdexRewards/SdexRewards';
import YourGovernanceVotes from './YourGovernanceVotes/YourGovernanceVotes';
import MyAquarius from '../../common/assets/img/my-aquarius.svg';
import Aqua from '../../common/assets/img/aqua-logo-small.svg';

const Container = styled.div`
    height: 100%;
    position: relative;
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    scroll-behavior: smooth;
    overflow: auto;
`;

const BgContainer = styled.div`
    ${flexAllCenter};
    flex-direction: column;
    width: 100%;
    height: 35vh;
    position: relative;
    overflow: hidden;
    background: ${COLORS.background};
`;

const MyAquariusLogo = styled(MyAquarius)`
    width: 100%;
    position: absolute;
    display: block;

    ${respondDown(Breakpoints.xxl)`
        width: unset;
        height: 100%;
    `};
`;

const AquaLogo = styled(Aqua)`
    height: 7.6rem;
    width: 7.6rem;
    margin-bottom: 2.2rem;
`;

const MainTitle = styled.h1`
    font-weight: 700;
    font-size: 8rem;
    line-height: 9.4rem;
    color: ${COLORS.white};

    ${respondDown(Breakpoints.lg)`
        font-size: 6rem;
        line-height: 7.2rem;
    `};

    ${respondDown(Breakpoints.sm)`
        font-size: 3rem;
        line-height: 4rem;
    `};
`;

const ControlsWrapper = styled.div`
    ${commonMaxWidth};
    width: 100%;
    padding: 0 4rem;
    margin-bottom: 5rem;

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem 2rem;
        background: ${COLORS.white};
    `}
`;

const ToggleGroupStyled = styled(ToggleGroup)`
    width: min-content;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const SelectStyled = styled(Select)`
    display: none;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

const ContentWrap = styled.div`
    width: 100%;
    background: ${COLORS.lightGray};
`;

const Content = styled.div`
    ${commonMaxWidth};
    width: 100%;
    padding: 5.6rem 4rem 4rem;
    background: ${COLORS.lightGray};

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem 2rem;
    `}
`;

enum Tabs {
    sdex = 'sdex',
    amm = 'amm',
    your = 'your',
    governance = 'governance',
}

const OPTIONS = [
    { label: 'SDEX rewards', value: Tabs.sdex },
    { label: 'AMM rewards', value: Tabs.amm },
    { label: 'Liquidity Votes', value: Tabs.your },
    { label: 'Governance Votes', value: Tabs.governance },
];

const Profile = () => {
    const [selectedTab, setSelectedTab] = useState(Tabs.sdex);
    return (
        <Container>
            <BgContainer>
                <MyAquariusLogo />
                <AquaLogo />
                <MainTitle>My Aquarius Account</MainTitle>
            </BgContainer>

            <AccountInfo />
            <ControlsWrapper>
                <ToggleGroupStyled
                    value={selectedTab}
                    options={OPTIONS}
                    onChange={setSelectedTab}
                />
                <SelectStyled value={selectedTab} options={OPTIONS} onChange={setSelectedTab} />
            </ControlsWrapper>

            <ContentWrap>
                <Content>
                    {selectedTab === Tabs.amm && <AmmRewards />}
                    {selectedTab === Tabs.sdex && <SdexRewards />}
                    {selectedTab === Tabs.your && <YourVotes />}
                    {selectedTab === Tabs.governance && <YourGovernanceVotes />}
                </Content>
            </ContentWrap>
        </Container>
    );
};

export default Profile;