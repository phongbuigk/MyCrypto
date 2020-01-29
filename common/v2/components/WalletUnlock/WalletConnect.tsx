import React, { useState, useContext, useEffect } from 'react';

import translate, { translateRaw } from 'v2/translations';
import { WalletId, TAddress } from 'v2/types';
import { WALLETS_CONFIG } from 'v2/config';
import { QRCode, Spinner } from 'v2/components';
import { WalletFactory, WalletConnectService } from 'v2/services/WalletService';
import { ToastContext } from 'v2/features/Toasts';

import './WalletConnect.scss';

interface OwnProps {
  onUnlock(param: any): void;
  goToPreviousStep(): void;
}

export enum WalletConnectQRState {
  READY, // use when walletConnect session is created
  CONNECTING, // use when walletConnect session needs to be created
  UNKNOWN // used upon component initialization when walletconnect status is not determined
}

const WalletService = WalletFactory(WalletId.WALLETCONNECT);
const wikiLink = WALLETS_CONFIG[WalletId.WALLETCONNECT].helpLink!;

export function WalletConnectDecrypt({ onUnlock, goToPreviousStep }: OwnProps) {
  const [uriData, setUriData] = useState();
  const { displayToast, toastTemplates } = useContext(ToastContext);

  useEffect(() => {
    // Set event handlers
    const session = WalletConnectService({
      handleInit: (uri: string) => {
        setUriData(uri);
      },
      handleConnect: (address: TAddress) => onUnlock(WalletService.init(address)),
      handleError: () => {
        displayToast(toastTemplates.somethingWentWrong);
      },
      handleReject: () => {
        goToPreviousStep();
        displayToast(toastTemplates.walletConnectReject);
      }
    });

    // Request a session connection
    session.init();
    // Make sure to kill the session when the component unmounts.
    return () => {
      session.kill();
    };
  }, []);

  return (
    <div className="WalletConnectPanel">
      <div className="Panel-title">
        {translate('UNLOCK_WALLET')} {`Your ${translateRaw('X_WALLETCONNECT')} device`}
      </div>
      <div className="WalletConnect">
        <section className="WalletConnect-fields">
          <section className="Panel-description">
            {translate('SIGNER_SELECT_WALLET_QR', { $walletId: translateRaw('X_WALLETCONNECT') })}
          </section>
          <section className="WalletConnect-fields-field">
            {uriData ? <QRCode data={uriData} /> : <Spinner />}
          </section>
        </section>
        {wikiLink && (
          <p className="WalletConnect-wiki-link">
            {translate('ADD_WALLETCONNECT_LINK', { $wiki_link: wikiLink })}
          </p>
        )}
      </div>
    </div>
  );
}

export default WalletConnectDecrypt;
