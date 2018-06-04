package org.drugis.addis.problems.model;

import java.net.URI;
import java.util.List;

/**
 * Created by connor on 25-3-14.
 */
public class CriterionEntry {
  private String criterion;
  private List<Double> scale;
  private PartialValueFunction pvf;
  private String title;
  private String unitOfMeasurement;
  private String source;
  private URI sourceLink;
  private List<DataSourceEntry> dataSources;

  public CriterionEntry(String criterion, String title) {
    this(criterion, title, null, null, null, null, null);
  }

  public CriterionEntry(String criterion, String title, String source, URI sourceLink) {
    this(criterion, title, null, null, null, source, sourceLink);
  }


  public CriterionEntry(String criterion, String title, List<Double> scale, PartialValueFunction partialValueFunction, String unitOfMeasurement, String source, URI sourceLink) {
    this.criterion = criterion;
    this.title = title;
    this.scale = scale;
    this.pvf = partialValueFunction;
    this.unitOfMeasurement = unitOfMeasurement;
    this.source = source;
    this.sourceLink = sourceLink;
  }

  public String getCriterion() {
    return criterion;
  }

  public String getTitle() {
    return title;
  }

  public List<Double> getScale() {
    return scale;
  }

  public PartialValueFunction getPvf() {
    return pvf;
  }

  public String getUnitOfMeasurement() {
    return unitOfMeasurement;
  }

  public String getSource() {
    return source;
  }

  public URI getSourceLink() {
    return sourceLink;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    CriterionEntry that = (CriterionEntry) o;

    if (!criterion.equals(that.criterion)) return false;
    if (!scale.equals(that.scale)) return false;
    if (pvf != null ? !pvf.equals(that.pvf) : that.pvf != null) return false;
    if (!title.equals(that.title)) return false;
    if (unitOfMeasurement != null ? !unitOfMeasurement.equals(that.unitOfMeasurement) : that.unitOfMeasurement != null)
      return false;
    if (source != null ? !source.equals(that.source) : that.source != null) return false;
    return sourceLink != null ? sourceLink.equals(that.sourceLink) : that.sourceLink == null;
  }

  @Override
  public int hashCode() {
    int result = criterion.hashCode();
    result = 31 * result + scale.hashCode();
    result = 31 * result + (pvf != null ? pvf.hashCode() : 0);
    result = 31 * result + title.hashCode();
    result = 31 * result + (unitOfMeasurement != null ? unitOfMeasurement.hashCode() : 0);
    result = 31 * result + (source != null ? source.hashCode() : 0);
    result = 31 * result + (sourceLink != null ? sourceLink.hashCode() : 0);
    return result;
  }
}
