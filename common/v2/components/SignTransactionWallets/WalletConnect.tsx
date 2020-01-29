import React, { useEffect, useReducer, useState, useContext } from 'react';

import translate, { translateRaw } from 'v2/translations';
import { Button, Spinner, InlineErrorMsg, QRCodeContainer } from 'v2/components';
import { WalletId, ISignComponentProps } from 'v2/types';
import { WALLETS_CONFIG } from 'v2/config';
import { WalletConnectContext } from 'v2/services/WalletService';

import { WalletConnectReducer, WalletConnectActions } from './WalletConnect.reducer';
import './WalletConnect.scss';

interface WalletConnectAddress {
  address: string;
  chainId: number;
}

export enum WalletSigningState {
  READY, // when signerWallet is ready to sendTransaction
  AWAITING_LOGIN, // used when component is awaiting login.
  UNKNOWN // used upon component initialization when wallet status is not determined
}

export interface IWalletConnectState {
  isCorrectAddress: boolean;
  isCorrectNetwork: boolean;
  detectedAddress: string;
  signingError: string;
  walletSigningState: WalletSigningState;
  displaySignReadyQR: boolean;
  isPendingTx: boolean;
  isConnected: boolean;
}

export const initialWalletConnectState: IWalletConnectState = {
  isCorrectAddress: false,
  isCorrectNetwork: false,
  detectedAddress: '',
  signingError: '',
  walletSigningState: WalletSigningState.UNKNOWN,
  displaySignReadyQR: false,
  isPendingTx: false,
  isConnected: false
};

export type WalletConnectQrContent = WalletConnectAddress;

const wikiLink = WALLETS_CONFIG[WalletId.WALLETCONNECT].helpLink!;

export function SignTransactionWalletConnect({
  senderAccount,
  rawTransaction,
  onSuccess
}: ISignComponentProps) {
  const { sendTransaction } = useContext(WalletConnectContext);
  const [state, dispatch] = useReducer(WalletConnectReducer, initialWalletConnectState);
  // This qrcode trigger is to handle user accessing the incorrect account on their WalletConnect device
  const [displaySignReadyQR, setDisplaySignReadyQR] = useState(false);
  const { session, handleUnlock, handleReset } = useContext(WalletConnectContext);
  const [isReady, setIsReady] = useState(false);

  const detectAddress = ({
    address: currentWalletConnectAddress,
    chainId: currentWalletConnectChainId
  }: WalletConnectQrContent) => {
    dispatch({
      type: WalletConnectActions.DETECT_ADDRESS,
      payload: {
        address: currentWalletConnectAddress,
        chainId: currentWalletConnectChainId,
        senderAccount,
        rawTransaction
      }
    });
  };

  /* start:wallet-login-state */
  // Used to reset the walletconnect session
  useEffect(() => {
    if (isReady) return;
    setIsReady(true);
    handleReset();
  });

  // Once walletconnect session is queued to reset, start unlock flow
  useEffect(() => {
    if (!isReady) return;
    handleUnlock(detectAddress);
  });
  /* end:wallet-login-state */

  const promptSignTransaction = async () => {
    if (!state.isConnected || !state.isCorrectNetwork || !state.isCorrectAddress) return;
    dispatch({
      type: WalletConnectActions.BROADCAST_SIGN_TX,
      payload: { isPendingTx: true }
    });
    sendTransaction({ from: state.detectedAddress, ...rawTransaction })
      .then((txHash: string) => {
        onSuccess(txHash);
      })
      .catch((err: any) => {
        dispatch({
          type: WalletConnectActions.BROADCAST_SIGN_TX_ERROR,
          payload: { errMsg: err.message }
        });
      });
  };

  // Used to prompt for signature
  useEffect(() => {
    if (
      !state.isCorrectAddress ||
      !state.isCorrectNetwork ||
      !state.isConnected ||
      state.walletSigningState === WalletSigningState.READY
    )
      return;
    dispatch({
      type: WalletConnectActions.SET_WALLET_SIGNING_STATE_READY
    });
  });

  // Used to trigger signTransaction
  useEffect(() => {
    if (state.walletSigningState !== WalletSigningState.READY) return;
    // Resubmits the transaction for signature on tx rejection.
    const walletSigner = setInterval(() => {
      if (state.isPendingTx) return;
      promptSignTransaction();
    }, 2000);
    return () => clearInterval(walletSigner);
  });

  return (
    <div className="WalletConnectPanel">
      <div className="Panel-title">
        {translate('SIGNER_SELECT_WALLETCONNECT', { $walletId: translateRaw('X_WALLETCONNECT') })}
      </div>
      {state.walletSigningState !== WalletSigningState.READY &&
        !state.isCorrectAddress &&
        !state.isCorrectNetwork && (
          <section className="Panel-description">
            {translate('SIGNER_SELECT_WALLET_QR', {
              $walletId: translateRaw('X_WALLETCONNECT')
            })}
          </section>
        )}
      <div className="WalletConnect">
        <section className="WalletConnect-fields">
          {state.walletSigningState === WalletSigningState.READY && (
            <>
              <div className="WalletConnect-fields-field">
                {translate('SIGN_TX_WALLETCONNECT_PENDING', {
                  $address: state.detectedAddress
                })}
              </div>
              {state.signingError !== '' && (
                <div className="WalletConnect-fields-error">
                  <InlineErrorMsg>
                    {translate('SIGN_TX_WALLETCONNECT_REJECTED', {
                      $walletName: translateRaw('X_WALLETCONNECT'),
                      $address: senderAccount.address
                    })}
                  </InlineErrorMsg>
                </div>
              )}
              {state.isPendingTx && (
                <div className="WalletConnect-fields-spinner">
                  <Spinner />
                </div>
              )}
            </>
          )}

          {state.isConnected && !state.isCorrectAddress && (
            <div className="WalletConnect-fields-field">
              {translate('SIGN_TX_WALLETCONNECT_FAILED_ACCOUNT', {
                $walletName: translateRaw('X_WALLETCONNECT'),
                $address: senderAccount.address
              })}
            </div>
          )}
          {state.isConnected && !state.isCorrectNetwork && (
            <div className="WalletConnect-fields-field">
              {translate('SIGN_TX_WALLETCONNECT_FAILED_NETWORK', {
                $walletName: translateRaw('X_WALLETCONNECT'),
                $network: senderAccount.networkId
              })}
            </div>
          )}
          {state.walletSigningState === WalletSigningState.READY && (
            <div className="WalletConnect-fields-field">
              <Button
                basic={true}
                className="WalletConnect-qr-code-option"
                onClick={() => setDisplaySignReadyQR(!displaySignReadyQR)}
              >
                {displaySignReadyQR
                  ? translateRaw('SIGN_TX_WALLETCONNECT_HIDE_QR')
                  : translateRaw('SIGN_TX_WALLETCONNECT_SHOW_QR')}
              </Button>
              {displaySignReadyQR && session && session.uri && (
                <section className="WalletConnect-fields-field">
                  <QRCodeContainer data={session.uri} />
                </section>
              )}
            </div>
          )}
        </section>
        {!(state.walletSigningState === WalletSigningState.READY) && session && session.uri && (
          <section className="WalletConnect-fields-field">
            <QRCodeContainer data={session.uri} />
          </section>
        )}
        {wikiLink && (
          <p className="WalletConnect-wiki-link">
            {translate('ADD_WALLETCONNECT_LINK', { $wiki_link: wikiLink })}
          </p>
        )}
      </div>
    </div>
  );
}

export default SignTransactionWalletConnect;
