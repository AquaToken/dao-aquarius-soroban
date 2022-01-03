import * as React from 'react';
import styled from 'styled-components';
import { flexAllCenter } from '../../../../../common/mixins';
import { COLORS } from '../../../../../common/styles';
import ArrowsCircle from '../../../../../common/assets/img/icon-arrows-circle.svg';
import { ModalService } from '../../../../../common/services/globalServices';
import AccountInput from '../../../common/AccountInput/AccountInput';

const Wrapper = styled.div`
    ${flexAllCenter};
    cursor: pointer;
`;

const ButtonText = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    margin-right: 1.6rem;
`;

const IconContainer = styled.div`
    ${flexAllCenter};
    background-color: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    height: 4.8rem;
    width: 4.8rem;
    border-radius: 50%;
`;

const OtherAccountButton = () => {
    const onClick = () => {
        ModalService.openModal(AccountInput, { isModal: true });
    };
    return (
        <Wrapper onClick={() => onClick()}>
            <ButtonText>Other account</ButtonText>
            <IconContainer>
                <ArrowsCircle />
            </IconContainer>
        </Wrapper>
    );
};

export default OtherAccountButton;