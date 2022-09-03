import BigNumber from 'bignumber.js';
import Unit from '../constants/Unit';
import lotusFormatter from './lotusFormatter';

export default function mojoToLotus(mojo: string | number | BigNumber): BigNumber {
  return lotusFormatter(mojo, Unit.MOJO)
    .to(Unit.LOTUS)
    .toBigNumber();
}