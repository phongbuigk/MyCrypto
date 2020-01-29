import WalletConnect from '@walletconnect/browser';
import { ITxData } from '@walletconnect/types';

import { TAddress } from 'v2/types';

const WALLET_CONNECT_BRIDGE_URI = 'https://bridge.walletconnect.org';

/*
  Wrapper around WalletConnect library to facilitate decoupling.
  We pass the eventHandlers on initialisaiton and
*/
interface EventHandlers {
  handleInit(uri: string): void;
  handleConnect(address: TAddress): void;
  handleError(error: Error): void;
  handleReject(error: Error): void;
  handleUpdate?(): void;
  handleSessionRequest?(uri: string): void;
  handleDisconnect?(params: any): void;
}

export default function WalletConnectService({
  handleInit,
  handleConnect,
  handleError,
  handleReject,
  // handleUpdate,
  // handleSessionRequest,
  handleDisconnect
}: EventHandlers) {
  const connector = new WalletConnect({
    bridge: WALLET_CONNECT_BRIDGE_URI
  });

  // Helper to extract message from payload.
  const getMessage = (payload: any) => (payload.params ? payload.params[0].message : false);

  const isConnected = connector.connected;
  const sendTx = (tx: ITxData) => connector.sendTransaction(tx);
  const kill = () => connector.killSession();

  const init = () => {
    // Make sure we are dealing with the same session.
    if (connector.connected) {
      kill();
    }
    connector.createSession().then(() => {
      // get uri for QR Code modal
      handleInit(connector.uri);
    });
  };

  // Subscribe to connection events
  connector.on('connect', (error, payload) => {
    if (error) {
      handleError(error);
    }
    const { accounts } = payload.params[0];
    console.debug('Connected', accounts, payload.params);
    handleConnect(accounts[0]);
  });

  connector.on('session_update', (error, payload) => {
    if (error) {
      handleError(error);
    }
    // Get updated accounts and chainId
    const { accounts, chainId } = payload.params[0];
    console.debug('update', accounts, chainId, payload);
  });

  connector.on('disconnect', (error, payload) => {
    if (error) {
      handleError(error);
    }

    // Call handler when it exists and we are dealing with a normal disconnect
    if (handleDisconnect && getMessage(payload) === 'Session Disconnected') {
      handleDisconnect(payload.params);
    } else {
      handleReject(payload);
    }
  });

  connector.on('session_request', (error, payload) => {
    if (error) {
      handleError(error);
    }
    console.debug('session_request', payload);
    // Delete walletConnector
  });

  return {
    init,
    kill,
    isConnected,
    sendTx
  };
}
