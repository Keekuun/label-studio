import { inject, observer } from "mobx-react";
import type { FC } from "react";
import { Block, Elem } from "../../../utils/bem";
import { Comments as CommentsComponent } from "../../Comments/Comments";
import { AnnotationHistory } from "../../CurrentEntity/AnnotationHistory";
import { PanelBase, type PanelProps } from "../PanelBase";
import "./DetailsPanel.scss";
import { RegionDetailsMain, RegionDetailsMeta } from "./RegionDetails";
import { RegionItem } from "./RegionItem";
import { Relations as RelationsComponent } from "./Relations";
// eslint-disable-next-line
// @ts-ignore
import { RelationsControls } from "./RelationsControls";
import { EmptyState } from "../Components/EmptyState";
import { IconCursor, IconRelationLink } from "@humansignal/icons";
import { getDocsUrl } from "../../../utils/docs";
import i18n from "i18next";

interface DetailsPanelProps extends PanelProps {
  regions: any;
  selection: any;
}

const DetailsPanelComponent: FC<DetailsPanelProps> = ({ currentEntity, regions, ...props }) => {
  const selectedRegions = regions.selection;

  return (
    <PanelBase {...props} currentEntity={currentEntity} name="details" title="Details">
      <Content selection={selectedRegions} currentEntity={currentEntity} />
    </PanelBase>
  );
};

const DetailsComponent: FC<DetailsPanelProps> = ({ currentEntity, regions }) => {
  const selectedRegions = regions.selection;

  return (
    <Block name="details-tab">
      <Content selection={selectedRegions} currentEntity={currentEntity} />
    </Block>
  );
};

const Content: FC<any> = observer(function Content({ selection, currentEntity }: any): JSX.Element {
  return <>{selection.size ? <RegionsPanel regions={selection} /> : <GeneralPanel currentEntity={currentEntity} />}</>;
});

const CommentsTab: FC<any> = inject("store")(
  observer(function CommentsTab({ store }: any): JSX.Element {
    return (
      <>
        {store.hasInterface("annotations:comments") && store.commentStore.isCommentable && (
          <Block name="comments-panel">
            <Elem name="section-tab">
              <Elem name="section-content">
                <CommentsComponent
                  annotationStore={store.annotationStore}
                  commentStore={store.commentStore}
                  cacheKey={`task.${store.task.id}`}
                />
              </Elem>
            </Elem>
          </Block>
        )}
      </>
    );
  }),
);

const RelationsTab: FC<any> = inject("store")(
  observer(function RelationsTab({ currentEntity }: any): JSX.Element {
    const { relationStore } = currentEntity;
    const hasRelations = relationStore.size > 0;

    return (
      <>
        <Block name="relations">
          <Elem name="section-tab">
            {hasRelations ? (
              <>
                <Elem name="view-control">
                  <Elem name="section-head">{i18n.t('Relations')} ({relationStore.size})</Elem>
                  <RelationsControls relationStore={relationStore} />
                </Elem>
                <Elem name="section-content">
                  <RelationsComponent relationStore={relationStore} />
                </Elem>
              </>
            ) : (
              <EmptyState
                icon={<IconRelationLink width={24} height={24} />}
                header="Create relations between regions"
                description={<>Link regions to define relationships between them</>}
                learnMore={{
                  href: getDocsUrl("guide/labeling#Add-relations-between-annotations"),
                  text: i18n.t('learn_more'),
                  testId: "relations-panel-learn-more",
                }}
              />
            )}
          </Elem>
        </Block>
      </>
    );
  }),
);

const HistoryTab: FC<any> = inject("store")(
  observer(function HistoryTab({ store, currentEntity }: any): JSX.Element {
    const showAnnotationHistory = store.hasInterface("annotations:history");

    return (
      <>
        <Block name="history">
          <Elem name="section-tab">
            <AnnotationHistory
              inline
              enabled={showAnnotationHistory}
              sectionHeader={
                <>
                  Annotation History
                  <span>#{currentEntity.pk ?? currentEntity.id}</span>
                </>
              }
            />
          </Elem>
        </Block>
      </>
    );
  }),
);

const InfoTab: FC<any> = inject("store")(
  observer(function InfoTab({ selection }: any): JSX.Element {
    const nothingSelected = !selection || selection.size === 0;
    return (
      <>
        <Block name="info">
          <Elem name="section-tab">
            {nothingSelected ? (
              <EmptyState
                icon={<IconCursor width={24} height={24} />}
                header={i18n.t('view_reg_details')}
                description={<>{i18n.t('view_reg_details_desc')}</>}
              />
            ) : (
              <>
                <RegionsPanel regions={selection} />
              </>
            )}
          </Elem>
        </Block>
      </>
    );
  }),
);

const GeneralPanel: FC<any> = inject("store")(
  observer(function GeneralPanel({ store, currentEntity }: any): JSX.Element {
    const { relationStore } = currentEntity;
    const showAnnotationHistory = store.hasInterface("annotations:history");
    return (
      <>
        <Elem name="section">
          <AnnotationHistory
            inline
            enabled={showAnnotationHistory}
            sectionHeader={
              <>
                {i18n.t('anno_history')}
                <span>#{currentEntity.pk ?? currentEntity.id}</span>
              </>
            }
          />
        </Elem>
        <Elem name="section">
          <Elem name="view-control">
            <Elem name="section-head">{i18n.t('relations')} ({relationStore.size})</Elem>
            <RelationsControls relationStore={relationStore} />
          </Elem>
          <Elem name="section-content">
            <RelationsComponent relationStore={relationStore} />
          </Elem>
        </Elem>
        {store.hasInterface("annotations:comments") && store.commentStore.isCommentable && (
          <Elem name="section">
            <Elem name="section-head">{i18n.t('comments')}</Elem>
            <Elem name="section-content">
              <CommentsComponent
                annotationStore={store.annotationStore}
                commentStore={store.commentStore}
                cacheKey={`task.${store.task.id}`}
              />
            </Elem>
          </Elem>
        )}
      </>
    );
  }),
);

GeneralPanel.displayName = "GeneralPanel";

const RegionsPanel: FC<{ regions: any }> = observer(function RegionsPanel({ regions }: { regions: any }): JSX.Element {
  return (
    <div>
      {regions.list.map((reg: any) => {
        return <SelectedRegion key={reg.id} region={reg} />;
      })}
    </div>
  );
});

const SelectedRegion: FC<{ region: any }> = observer(function SelectedRegion({ region }: { region: any }): JSX.Element {
  return <RegionItem region={region} mainDetails={RegionDetailsMain} metaDetails={RegionDetailsMeta} />;
});

export const Comments = CommentsTab;
export const History = HistoryTab;
export const Relations = RelationsTab;
export const Info = InfoTab;
export const Details = observer(DetailsComponent);
export const DetailsPanel = observer(DetailsPanelComponent);
