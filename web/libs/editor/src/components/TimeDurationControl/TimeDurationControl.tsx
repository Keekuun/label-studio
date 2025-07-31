import type { FC } from "react";
import { Block } from "../../utils/bem";

import "./TimeDurationControl.scss";
import { TimeBox } from "./TimeBox";
import i18n from "i18next";

export interface TimerProps {
  isSidepanel: boolean | undefined;
  startTime: number;
  endTime: number | undefined;
  minTime: number;
  maxTime: number | undefined;
  currentTime?: number;
  startTimeReadonly?: boolean;
  endTimeReadonly?: boolean;
  onChangeStartTime?: (value: number) => void;
  onChangeEndTime?: (value: number) => void;
  showDuration?: boolean;
  showLabels?: boolean;
}

export const TimeDurationControl: FC<TimerProps> = ({
  isSidepanel = false,
  startTime,
  endTime = 0,
  minTime,
  maxTime = 0,
  currentTime,
  startTimeReadonly = false,
  endTimeReadonly = false,
  onChangeStartTime,
  onChangeEndTime,
  showDuration = false,
  showLabels = false,
}) => {
  const _currentTime = !currentTime ? startTime : currentTime;

  const handleChangeCurrentTime = (value: number) => {
    if (value >= minTime && value <= maxTime && value <= endTime) onChangeStartTime?.(value);
  };

  const handleChangeEndTime = (value: number) => {
    if (value >= minTime && value <= maxTime && value >= _currentTime) onChangeEndTime?.(value);
  };

  return (
    <Block name="timer-duration-control">
      <TimeBox
        sidepanel={isSidepanel}
        readonly={startTimeReadonly}
        value={_currentTime}
        onChange={handleChangeCurrentTime}
        label={showLabels ? i18n.t('start') : undefined}
        data-testid="timebox-current-time"
      />
      <TimeBox
        sidepanel={isSidepanel}
        readonly={endTimeReadonly}
        value={endTime}
        onChange={handleChangeEndTime}
        data-testid="timebox-end-time"
        label={showLabels ? i18n.t('end') : undefined}
      />
      {showDuration && (
        <TimeBox
          sidepanel={isSidepanel}
          readonly={true}
          value={endTime - startTime}
          onChange={() => {}}
          data-testid="timebox-duration-time"
          label={showLabels ? i18n.t('duration') : undefined}
        />
      )}
    </Block>
  );
};
