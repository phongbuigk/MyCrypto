import { ExtendedAccount, ITxObject } from 'v2/types';
import { IWalletConnectState, WalletSigningState } from './WalletConnect';

export enum WalletConnectActions {
  DETECT_ADDRESS,
  BROADCAST_SIGN_TX,
  BROADCAST_SIGN_TX_ERROR,
  CLEAR_ERROR,
  SET_WALLET_SIGNING_STATE_READY
}

export interface IWalletConnectActions {
  type: WalletConnectActions;
  payload?: any;
}

export function WalletConnectReducer(
  state: IWalletConnectState,
  { type, payload }: IWalletConnectActions
) {
  switch (type) {
    case WalletConnectActions.DETECT_ADDRESS: {
      const {
        address,
        chainId,
        senderAccount,
        rawTransaction
      }: {
        address: string;
        chainId: number;
        senderAccount: ExtendedAccount;
        rawTransaction: ITxObject;
      } = payload;
      return {
        ...state,
        isConnected: true,
        detectedAddress: address,
        isCorrectAddress: address.toLowerCase() === senderAccount.address.toLowerCase(),
        isCorrectNetwork: chainId === rawTransaction.chainId
      };
    }
    case WalletConnectActions.BROADCAST_SIGN_TX: {
      const { isPendingTx } = payload;
      return {
        ...state,
        isPendingTx
      };
    }
    case WalletConnectActions.BROADCAST_SIGN_TX_ERROR: {
      const { errMsg, isPendingTx } = payload;
      return {
        ...state,
        signingError: errMsg,
        isPendingTx
      };
    }
    case WalletConnectActions.CLEAR_ERROR: {
      return {
        ...state,
        signingError: ''
      };
    }
    case WalletConnectActions.SET_WALLET_SIGNING_STATE_READY: {
      return {
        ...state,
        walletSigningState: WalletSigningState.READY
      };
    }
    default: {
      throw new Error('[WalletConnect]: missing action type');
    }
  }
}
