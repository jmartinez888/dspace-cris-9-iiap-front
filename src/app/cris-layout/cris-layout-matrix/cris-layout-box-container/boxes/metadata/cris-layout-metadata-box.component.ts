
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import {
  CrisLayoutBox,
  LayoutField,
  LayoutFieldType,
  MetadataBoxConfiguration,
  MetadataBoxRow,
} from '../../../../../core/layout/models/box.model';
import { Item } from '../../../../../core/shared/item.model';
import { hasValue } from '../../../../../shared/empty.util';
import { CrisLayoutBoxModelComponent } from '../../../../models/cris-layout-box-component.model';
import { RowComponent } from './row/row.component';

/**
 * This component renders the metadata boxes of items
 */
@Component({
  selector: 'ds-cris-layout-metadata-box',
  templateUrl: './cris-layout-metadata-box.component.html',
  styleUrls: ['./cris-layout-metadata-box.component.scss'],
  imports: [
    RowComponent,
  ],
})
/**
 * For overwrite this component create a new one that extends CrisLayoutBoxObj and
 * add the CrisLayoutBoxModelComponent decorator indicating the type of box to overwrite
 */
export class CrisLayoutMetadataBoxComponent extends CrisLayoutBoxModelComponent implements OnInit, OnDestroy {

  /**
   * Contains the fields configuration for current box
   */
  metadataBoxConfiguration: MetadataBoxConfiguration;

  /**
   * List of subscriptions
   */
  subs: Subscription[] = [];

  constructor(
    public cdr: ChangeDetectorRef,
    protected translateService: TranslateService,
    @Inject('boxProvider') public boxProvider: CrisLayoutBox,
    @Inject('itemProvider') public itemProvider: Item,
  ) {
    super(translateService, boxProvider, itemProvider);
  }

  ngOnInit() {
    super.ngOnInit();
    let config = this.box.configuration as MetadataBoxConfiguration;
    // Apply Project-specific metadata reordering for the details/primarydata box
    const entityType = this.item?.firstMetadataValue('dspace.entity.type');
    if (entityType === 'Project' && (this.box.shortname === 'details' || this.box.shortname === 'primarydata')) {
      config = this.processProjectDetailsBox(config);
    }
    this.setMetadataComponents(config);
  }

  /**
   * Set the metadataBoxConfiguration.
   * @param metadatacomponents
   */
  setMetadataComponents(metadatacomponents: MetadataBoxConfiguration) {
    this.metadataBoxConfiguration = metadatacomponents;
    this.cdr.detectChanges();
  }

  /**
   * Reorder and enrich the metadata configuration for Project entity detail boxes.
   * This ensures the required display order regardless of backend configuration order.
   *
   * Required order:
   * 1. oairecerif.acronym
   * 2. crispj.contractorou
   * 3. crispj.investigator
   * 4. crispj.coordinator
   * 5. crispj.coinvestigators
   * 6. oairecerif.project.startDate
   * 7. oairecerif.project.endDate
   * 8. oairecerif.project.status
   * 9. dc.subject (tag rendering)
   * 10. perucris.subject.ocde (tag rendering)
   */
  private processProjectDetailsBox(config: MetadataBoxConfiguration): MetadataBoxConfiguration {
    if (!config?.rows) {
      return config;
    }

    // Collect all existing fields from all rows/cells
    const existingFields: LayoutField[] = [];
    for (const row of config.rows) {
      for (const cell of (row.cells || [])) {
        for (const field of (cell.fields || [])) {
          existingFields.push(field);
        }
      }
    }

    // Consistent column widths for label/value alignment (matching Person/OrgUnit)
    const LABEL_COL = 'col-sm-4 font-weight-bold';
    const VALUE_COL = ''; // The wrapper already has 'col', we don't want col-sm-8 on every item inside flex-column

    // Define the required field order with their rendering configurations
    const requiredFieldOrder: Array<{
      metadata: string;
      label: string;
      rendering: string;
      fieldType: string;
      labelAsHeading: boolean;
      valuesInline: boolean;
      style?: string;
      styleLabel?: string;
      styleValue?: string;
    }> = [
        {
          metadata: 'oairecerif.acronym',
          label: 'Acrónimo',
          rendering: 'text',
          fieldType: LayoutFieldType.METADATA,
          labelAsHeading: false,
          valuesInline: false,
          styleLabel: LABEL_COL,
          styleValue: VALUE_COL,
        },
        {
          metadata: 'crispj.contractorou',
          label: 'Organización Ejecutora Principal',
          rendering: 'crisref',
          fieldType: LayoutFieldType.METADATA,
          labelAsHeading: false,
          valuesInline: false,
          styleLabel: LABEL_COL,
          styleValue: VALUE_COL,
        },
        {
          metadata: 'crispj.investigator',
          label: 'Investigador Principal',
          rendering: 'crisref',
          fieldType: LayoutFieldType.METADATA,
          labelAsHeading: false,
          valuesInline: false,
          styleLabel: LABEL_COL,
          styleValue: VALUE_COL,
        },
        {
          metadata: 'crispj.coordinator',
          label: 'Coordinador General',
          rendering: 'crisref',
          fieldType: LayoutFieldType.METADATA,
          labelAsHeading: false,
          valuesInline: false,
          styleLabel: LABEL_COL,
          styleValue: VALUE_COL,
        },
        {
          metadata: 'crispj.coinvestigators',
          label: 'Co-Investigadores',
          rendering: 'crisref',
          fieldType: LayoutFieldType.METADATA,
          labelAsHeading: false,
          valuesInline: false,
          styleLabel: LABEL_COL,
          styleValue: VALUE_COL,
        },
        {
          metadata: 'oairecerif.project.startDate',
          label: 'Fecha de Inicio',
          rendering: 'date',
          fieldType: LayoutFieldType.METADATA,
          labelAsHeading: false,
          valuesInline: false,
          styleLabel: LABEL_COL,
          styleValue: VALUE_COL,
        },
        {
          metadata: 'oairecerif.project.endDate',
          label: 'Fecha de Finalización',
          rendering: 'date',
          fieldType: LayoutFieldType.METADATA,
          labelAsHeading: false,
          valuesInline: false,
          styleLabel: LABEL_COL,
          styleValue: VALUE_COL,
        },
        {
          metadata: 'dc.subject',
          label: 'Palabras Clave',
          rendering: 'tag',
          fieldType: LayoutFieldType.METADATA,
          labelAsHeading: true,
          valuesInline: false,
          styleLabel: LABEL_COL,
          style: 'project-tag-green',
        },
      ];

    // Build a map of existing fields for quick lookup
    const existingFieldMap = new Map<string, LayoutField>();
    for (const field of existingFields) {
      if (field.metadata) {
        existingFieldMap.set(field.metadata, field);
      }
    }

    // Build the ordered field list, merging existing config with required defaults
    const orderedFields: LayoutField[] = [];
    for (const required of requiredFieldOrder) {
      // Only include the field if the item actually has this metadata
      if (!this.item.firstMetadataValue(required.metadata) &&
        this.item.allMetadata(required.metadata).length === 0) {
        continue;
      }

      const existing = existingFieldMap.get(required.metadata);
      if (existing) {
        // Preserve existing field config but override rendering for specific cases
        const mergedField: LayoutField = { ...existing };

        // Override rendering for status to ensure valuepair is used
        if (required.metadata === 'oairecerif.project.status') {
          mergedField.rendering = required.rendering;
        }
        // Override rendering for tags
        if (required.metadata === 'dc.subject' || required.metadata === 'perucris.subject.ocde') {
          mergedField.rendering = required.rendering;
          mergedField.labelAsHeading = required.labelAsHeading;
          if (required.style) {
            mergedField.style = required.style;
          }
        }

        // Force consistent column widths for alignment (non-tag fields)
        if (!required.labelAsHeading) {
          mergedField.styleLabel = LABEL_COL;
          mergedField.styleValue = VALUE_COL;
        }

        // Ensure label is set
        if (!mergedField.label) {
          mergedField.label = required.label;
        }
        orderedFields.push(mergedField);
        existingFieldMap.delete(required.metadata);
      } else {
        // Create a new field definition
        const newField: LayoutField = {
          metadata: required.metadata,
          label: required.label,
          rendering: required.rendering,
          fieldType: required.fieldType,
          labelAsHeading: required.labelAsHeading,
          valuesInline: required.valuesInline,
          style: required.style || 'mb-2',
          styleLabel: required.styleLabel || LABEL_COL,
          styleValue: required.styleValue || VALUE_COL,
        };
        orderedFields.push(newField);
      }
    }

    // Separate non-tag fields (compact, same cell) from tag fields (own row each)
    const compactFields: LayoutField[] = [];
    const tagFields: LayoutField[] = [];
    for (const field of orderedFields) {
      if (field.labelAsHeading) {
        tagFields.push(field);
      } else {
        compactFields.push(field);
      }
    }

    // Build rows: all compact fields in ONE cell (like OrgUnit/Person),
    // each tag field in its own row (needs full-width flex-column layout)
    const newRows: MetadataBoxRow[] = [];

    if (compactFields.length > 0) {
      newRows.push({
        style: '',
        cells: [{
          style: 'col-12',
          fields: compactFields,
        }],
      });
    }

    for (const tagField of tagFields) {
      newRows.push({
        style: '',
        cells: [{
          style: 'col-12',
          fields: [tagField],
        }],
      });
    }

    return {
      ...config,
      rows: newRows,
    };
  }

  /**
   * Unsubscribes all subscriptions
   */
  ngOnDestroy(): void {
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
  }
}
