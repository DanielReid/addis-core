package org.drugis.addis.analyses.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.drugis.addis.outcomes.Outcome;
import org.drugis.trialverse.util.Utils;

import javax.persistence.*;
import java.io.Serializable;
import java.util.*;

/**
 * Created by connor on 6-5-14.
 */
@Entity
@JsonIgnoreProperties(ignoreUnknown = true)
@PrimaryKeyJoinColumn(name = "id", referencedColumnName = "id")
public class NetworkMetaAnalysis extends AbstractAnalysis implements Serializable {
  private Integer primaryModel;

  @JsonProperty("excludedArms")
  @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, mappedBy = "analysisId", orphanRemoval = true)
  private Set<ArmExclusion> excludedArms = new HashSet<>();

  @JsonProperty("includedCovariates")
  @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, mappedBy = "analysisId", orphanRemoval = true)
  private Set<CovariateInclusion> includedCovariates = new HashSet<>();

  @JsonProperty("includedMeasurementMoments")
  @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, mappedBy = "analysisId", orphanRemoval = true)
  private Set<MeasurementMomentInclusion> includedMeasurementMoments = new HashSet<>();

  @ManyToOne(targetEntity = Outcome.class)
  @JoinColumn(name = "outcomeId")
  private Outcome outcome;

  public NetworkMetaAnalysis() {
  }

  public NetworkMetaAnalysis(Integer id, Integer projectId, String title, Outcome outcome) {
    this.id = id;
    this.projectId = projectId;
    this.title = title;
    this.outcome = outcome;
  }

  public NetworkMetaAnalysis(Integer projectId, String title) {
    this.projectId = projectId;
    this.title = title;
  }

  public NetworkMetaAnalysis(Integer id, Integer projectId, String title) {
    this(id, projectId, title, null);
  }

  public NetworkMetaAnalysis(Integer id, Integer projectId, String title,
                             List<ArmExclusion> excludedArms,
                             List<InterventionInclusion> interventionInclusions,
                             List<CovariateInclusion> includedCovariates, Outcome outcome) {
    this.id = id;
    this.projectId = projectId;
    this.title = title;
    this.excludedArms = excludedArms == null ? new HashSet<>() : new HashSet<>(excludedArms);
    this.interventionInclusions = interventionInclusions == null ? new HashSet<>() : new HashSet<>(interventionInclusions);
    this.includedCovariates = includedCovariates == null ? new HashSet<>() : new HashSet<>(includedCovariates);
    this.outcome = outcome;
  }

  @Override
  public Integer getId() {
    return id;
  }

  @Override
  public Integer getProjectId() {
    return projectId;
  }

  public String getTitle() {
    return title;
  }

  @JsonIgnore
  public List<ArmExclusion> getExcludedArms() {
    return Collections.unmodifiableList(new ArrayList<>(excludedArms));
  }

  @JsonIgnore
  public List<CovariateInclusion> getCovariateInclusions() {
    return Collections.unmodifiableList(new ArrayList<>(includedCovariates));
  }

  public void updateCovariateInclusions(List<CovariateInclusion> newInclusions) {
    this.includedCovariates.clear();
    this.includedCovariates.addAll(newInclusions);
  }

  @JsonIgnore
  public Set<MeasurementMomentInclusion> getIncludedMeasurementMoments() {
    return Collections.unmodifiableSet(includedMeasurementMoments);
  }

  public void updateMeasurementMomentInclusions(Set<MeasurementMomentInclusion> newInclusions) {
    this.includedMeasurementMoments.clear();
    this.includedMeasurementMoments.addAll(newInclusions);
  }

  public Outcome getOutcome() {
    return outcome;
  }

  public void setOutcome(Outcome outcome) {
    this.outcome = outcome;
  }

  public Integer getPrimaryModel() {
    return primaryModel;
  }

  public void setPrimaryModel(Integer primaryModel) {
    this.primaryModel = primaryModel;
  }

  public void updateArmExclusions(Set<ArmExclusion> excludedArms) {
    Utils.updateSet(this.excludedArms, excludedArms);
  }

  public void updateIncludedCovariates(Set<CovariateInclusion> includedCovariates) {
    Utils.updateSet(this.includedCovariates, includedCovariates);
  }

  public void updateIncludedMeasurementMoments(Set<MeasurementMomentInclusion> newInclusions) {
    Utils.updateSet(this.includedMeasurementMoments, newInclusions);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    if (!super.equals(o)) return false;
    NetworkMetaAnalysis that = (NetworkMetaAnalysis) o;
    return Objects.equals(primaryModel, that.primaryModel) &&
            Objects.equals(excludedArms, that.excludedArms) &&
            Objects.equals(includedCovariates, that.includedCovariates) &&
            Objects.equals(includedMeasurementMoments, that.includedMeasurementMoments) &&
            Objects.equals(outcome, that.outcome);
  }

  @Override
  public int hashCode() {

    return Objects.hash(super.hashCode(), primaryModel, excludedArms, includedCovariates, includedMeasurementMoments, outcome);
  }
}