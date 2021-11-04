import * as React from 'react';
import { useState } from 'react';
import { ModalDescription, ModalProps, ModalTitle } from '../atoms/ModalAtoms';
import Button from '../../basics/Button';
import styled from 'styled-components';
import { IconFail, IconPending, IconSuccess } from '../../basics/Icons';
import { flexAllCenter } from '../../mixins';
import DotsLoader from '../../basics/DotsLoader';
import { BuildSignAndSubmitStatuses } from '../../services/wallet-connect.service';
import { COLORS } from '../../styles';

enum TX_STATUSES {
    pending = 'pending',
    success = 'success',
    fail = 'fail',
    awaitSigners = 'await signers',
}

const STATUS_DESCRIPTION = {
    [TX_STATUSES.pending]: 'Waiting For Confirmation',
    [TX_STATUSES.success]: 'Transaction Completed',
    [TX_STATUSES.fail]: 'Transaction Rejected',
    [TX_STATUSES.awaitSigners]: 'Transaction Confirmed. More signatures required to complete',
};

const IconContainer = styled.div`
    padding-top: 8rem;
    padding-bottom: 2.4rem;
    width: 50rem;
    background-color: ${COLORS.lightGray};
    ${flexAllCenter};
`;

const Status = styled.div`
    padding-top: 2.4rem;
    padding-bottom: 4.5rem;
    background-color: ${COLORS.lightGray};
    ${flexAllCenter};
`;

const RightButton = styled(Button)`
    margin-top: 3.2rem;
    margin-left: auto;
`;

interface RequestModalProps {
    name: string;
    result: Promise<{ status: BuildSignAndSubmitStatuses }>;
}

const RequestModal = ({ params, close }: ModalProps<RequestModalProps>) => {
    const { name, result } = params;

    const [status, setStatus] = useState(TX_STATUSES.pending);

    result
        .then((result) => {
            if (!result) {
                return;
            }
            if (result.status === BuildSignAndSubmitStatuses.success) {
                setStatus(TX_STATUSES.success);
            } else if (result.status === BuildSignAndSubmitStatuses.pending) {
                setStatus(TX_STATUSES.awaitSigners);
            }
        })
        .catch(() => setStatus(TX_STATUSES.fail));

    return (
        <>
            <ModalTitle>Transaction</ModalTitle>
            <ModalDescription>View and sign the transaction in {name}</ModalDescription>

            <IconContainer>
                {status === TX_STATUSES.pending && <IconPending isBig />}
                {status === TX_STATUSES.fail && <IconFail isBig />}
                {status === TX_STATUSES.success && <IconSuccess isBig />}
            </IconContainer>

            <Status>
                {STATUS_DESCRIPTION[status]}
                {status === TX_STATUSES.pending && <DotsLoader />}
            </Status>

            <RightButton onClick={() => close()}>Close</RightButton>
        </>
    );
};

export default RequestModal;
