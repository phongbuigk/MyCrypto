import { translateRaw } from 'v2/translations';
import { ROUTE_PATHS, EXT_URLS } from 'v2/config';
import { Action } from './types';

// Legacy
import buyIcon from 'common/assets/images/icn-buy.svg';
import swapIcon from 'common/assets/images/icn-swap.svg';
import sendIcon from 'common/assets/images/icn-send.svg';
import receiveIcon from 'common/assets/images/icn-receive.svg';
import ledgerIcon from 'common/assets/images/wallets/ledger.svg';
import trezorIcon from 'common/assets/images/wallets/trezor.svg';

const randomWallet = () => {
  const hardwareWallets = [
    {
      icon: ledgerIcon,
      title: translateRaw('DASHBOARD_ACTIONS_GET_WALLET_TITLE'),
      link: EXT_URLS.LEDGER_REFERRAL.path,
      description: translateRaw('DASHBOARD_ACTIONS_GET_WALLET_SUBTITLE', { $wallet: 'Ledger' })
    },
    {
      icon: trezorIcon,
      title: translateRaw('DASHBOARD_ACTIONS_GET_WALLET_TITLE'),
      link: EXT_URLS.TREZOR_REFERRAL.path,
      description: translateRaw('DASHBOARD_ACTIONS_GET_WALLET_SUBTITLE', { $wallet: 'Trezor' })
    }
  ];

  return hardwareWallets[Math.floor(Math.random() * hardwareWallets.length)];
};

export const actions: Action[] = [
  {
    icon: buyIcon,
    title: translateRaw('DASHBOARD_ACTIONS_BUY_ASSETS_TITLE'),
    link: ROUTE_PATHS.BUY.path,
    description: translateRaw('DASHBOARD_ACTIONS_BUY_ASSETS_SUBTITLE')
  },
  {
    icon: swapIcon,
    title: translateRaw('DASHBOARD_ACTIONS_SWAP_ASSETS_TITLE'),
    link: ROUTE_PATHS.SWAP.path,
    description: translateRaw('DASHBOARD_ACTIONS_SWAP_ASSETS_SUBTITLE')
  },
  {
    icon: sendIcon,
    title: translateRaw('DASHBOARD_ACTIONS_SEND_ASSETS_TITLE'),
    link: ROUTE_PATHS.SEND.path,
    description: translateRaw('DASHBOARD_ACTIONS_SEND_ASSETS_SUBTITLE')
  },
  {
    icon: receiveIcon,
    title: translateRaw('DASHBOARD_ACTIONS_REQUEST_ASSETS_TITLE'),
    link: ROUTE_PATHS.REQUEST_ASSETS.path,
    description: translateRaw('DASHBOARD_ACTIONS_REQUEST_ASSETS_SUBTITLE')
  },
  randomWallet()
];
