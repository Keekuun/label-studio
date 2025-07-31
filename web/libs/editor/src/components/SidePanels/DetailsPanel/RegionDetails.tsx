import { observer } from "mobx-react";
import { type FC, useEffect, useMemo, useRef } from "react";
import { Block, Elem, useBEM } from "../../../utils/bem";
import { RegionEditor } from "./RegionEditor";
import "./RegionDetails.scss";
import { Typography } from "@humansignal/ui";
import i18n from "i18next";

const TextResult: FC<{ mainValue: string[] }> = observer(({ mainValue }) => {
  return (
    <div className="flex flex-col items-start gap-tighter">
      {mainValue.map((value: string, i: number) => (
        <mark
          key={`${value}-${i}`}
          className="bg-primary-background px-tighter py-tightest rounded-sm text-neutral-content"
        >
          <Typography data-counter={i + 1} size="small" className="!m-0">
            {value}
          </Typography>
        </mark>
      ))}
    </div>
  );
});

const ChoicesResult: FC<{ mainValue: string[] }> = observer(({ mainValue }) => {
  return (
    <mark className="bg-primary-background px-tighter py-tightest rounded-sm">
      <Typography as="span" size="small" className="text-neutral-content">
        {mainValue.join(", ")}
      </Typography>
    </mark>
  );
});

const RatingResult: FC<{ mainValue: string[] }> = observer(({ mainValue }) => {
  return <span>{mainValue}</span>;
});

export const ResultItem: FC<{ result: any }> = observer(({ result }) => {
  const { type, mainValue } = result;
  /**
   * @todo before fix this var was always false, so fix is left commented out
   * intention was to don't show per-region textarea text twice —
   * in region list and in region details; it failed but there were no complaints
   */
  // const isRegionList = from_name.displaymode === PER_REGION_MODES.REGION_LIST;

  const content = useMemo(() => {
    if (type === "rating") {
      return (
        <Elem name="result">
          <Typography size="small">{i18n.t('rating')}: </Typography>
          <Elem name="value">
            <RatingResult mainValue={mainValue} />
          </Elem>
        </Elem>
      );
    }
    if (type === "textarea") {
      return (
        <Elem name="result">
          <Typography size="small">{i18n.t('text')}: </Typography>
          <Elem name="value">
            <TextResult mainValue={mainValue} />
          </Elem>
        </Elem>
      );
    }
    if (type === "choices") {
      return (
        <Elem name="result">
          <Typography size="small">{i18n.t('choices')}: </Typography>
          <Elem name="value">
            <ChoicesResult mainValue={mainValue} />
          </Elem>
        </Elem>
      );
    }
    if (type === "taxonomy") {
      return (
        <Elem name="result">
          <Typography size="small">{i18n.t('taxonomy')}: </Typography>
          <Elem name="value">
            <ChoicesResult mainValue={mainValue.map((v: string[]) => v.join("/"))} />
          </Elem>
        </Elem>
      );
    }
  }, [type, mainValue]);

  return content ? <Block name="region-meta">{content}</Block> : null;
});

export const RegionDetailsMain: FC<{ region: any }> = observer(({ region }) => {
  return (
    <>
      <Elem name="result">
        {(region?.results as any[]).map((res) => (
          <ResultItem key={res.pid} result={res} />
        ))}
        {region?.text ? (
          <Block name="region-meta">
            <Elem name="item">
              <Elem name="content" mod={{ type: "text" }}>
                {region.text.replace(/\\n/g, "\n")}
              </Elem>
            </Elem>
          </Block>
        ) : null}
      </Elem>
      <RegionEditor region={region} />
    </>
  );
});

type RegionDetailsMetaProps = {
  region: any;
  editMode?: boolean;
  cancelEditMode?: () => void;
  enterEditMode?: () => void;
};

export const RegionDetailsMeta: FC<RegionDetailsMetaProps> = observer(
  ({ region, editMode, cancelEditMode, enterEditMode }) => {
    const bem = useBEM();
    const input = useRef<HTMLTextAreaElement | null>();

    const saveMeta = (value: string) => {
      region.setMetaText(value);
    };

    useEffect(() => {
      if (editMode && input.current) {
        const { current } = input;

        current.focus();
        current.setSelectionRange(current.value.length, current.value.length);
      }
    }, [editMode]);

    return (
      <>
        {editMode ? (
          <textarea
            ref={(el) => (input.current = el)}
            placeholder="Meta"
            className={bem.elem("meta-text").toClassName()}
            value={region.meta.text}
            onChange={(e) => saveMeta(e.target.value)}
            onBlur={(e) => {
              saveMeta(e.target.value);
              cancelEditMode?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                saveMeta(e.target.value);
                cancelEditMode?.();
              }
            }}
          />
        ) : (
          region.meta?.text && (
            <Elem name="meta-text" onClick={() => enterEditMode?.()}>
              {region.meta?.text}
            </Elem>
          )
        )}
      </>
    );
  },
);
