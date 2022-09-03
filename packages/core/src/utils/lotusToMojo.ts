import BigNumber from 'bignumber.js';
import Unit from '../constants/Unit';
import lotusFormatter from './lotusFormatter';

export default function lotusToMojo(lotus: string | number | BigNumber): BigNumber {
  return lotusFormatter(lotus, Unit.LOTUS)
    .to(Unit.MOJO)
    .toBigNumber();
}