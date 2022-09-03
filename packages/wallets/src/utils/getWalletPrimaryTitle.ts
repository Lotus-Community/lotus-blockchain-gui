import { WalletType } from '@lotus/api';
import type { Wallet } from '@lotus/api';

export default function getWalletPrimaryTitle(wallet: Wallet): string {
  switch (wallet.type) {
    case WalletType.STANDARD_WALLET:
      return 'Lotus';
    default:
      return wallet.meta?.name ?? wallet.name;
  }
}
