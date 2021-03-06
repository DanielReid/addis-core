package org.drugis.addis.analyses.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonRawValue;

import javax.persistence.*;
import java.io.Serializable;
import java.util.*;

@Entity
@JsonIgnoreProperties(ignoreUnknown = true)
@PrimaryKeyJoinColumn(name = "id", referencedColumnName = "id")
public class BenefitRiskAnalysis extends AbstractAnalysis implements Serializable {
  private boolean finalized = false;

  @JsonRawValue
  private String problem;

  @OneToMany(fetch = FetchType.EAGER, mappedBy = "analysisId", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<BenefitRiskNMAOutcomeInclusion> benefitRiskNMAOutcomeInclusions = new HashSet<>();

  @OneToMany(fetch = FetchType.EAGER, mappedBy = "analysisId", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<BenefitRiskStudyOutcomeInclusion> benefitRiskStudyOutcomeInclusions = new HashSet<>();

  public BenefitRiskAnalysis() {
  }

  public BenefitRiskAnalysis(Integer projectId, String title) {
    this.projectId = projectId;
    this.title = title;
  }

  public BenefitRiskAnalysis(Integer id, Integer projectId, String title) {
    this.id = id;
    this.projectId = projectId;
    this.title = title;
  }

  public BenefitRiskAnalysis(Integer id, Integer projectId, String title, Set<InterventionInclusion> interventionInclusions) {
    this.id = id;
    this.projectId = projectId;
    this.title = title;
    this.interventionInclusions = interventionInclusions;
  }

  @Override
  public Integer getProjectId() {
    return projectId;
  }

  @Override
  public Integer getId() {
    return id;
  }

  public List<BenefitRiskNMAOutcomeInclusion> getBenefitRiskNMAOutcomeInclusions() {
    return Collections.unmodifiableList(new ArrayList<>(benefitRiskNMAOutcomeInclusions));
  }

  public List<BenefitRiskStudyOutcomeInclusion> getBenefitRiskStudyOutcomeInclusions() {
    return Collections.unmodifiableList(new ArrayList<>(benefitRiskStudyOutcomeInclusions));
  }

  public String getTitle() {
    return title;
  }

  @JsonRawValue
  public String getProblem() {
    return problem;
  }

  public boolean isFinalized() {
    return finalized;
  }
  public void setFinalized(boolean finalized) {
    this.finalized = finalized;
  }

  public void setProblem(String problem) {
    this.problem = problem;
  }

  public void setBenefitRiskNMAOutcomeInclusions(List<BenefitRiskNMAOutcomeInclusion> benefitRiskNMAOutcomeInclusions) {
    this.benefitRiskNMAOutcomeInclusions.clear();
    this.benefitRiskNMAOutcomeInclusions.addAll(benefitRiskNMAOutcomeInclusions);
  }

  public void setBenefitRiskStudyOutcomeInclusions(List<BenefitRiskStudyOutcomeInclusion> benefitRiskStudyOutcomeInclusions) {
    this.benefitRiskStudyOutcomeInclusions.clear();
    this.benefitRiskStudyOutcomeInclusions.addAll(benefitRiskStudyOutcomeInclusions);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    if (!super.equals(o)) return false;
    BenefitRiskAnalysis that = (BenefitRiskAnalysis) o;
    return finalized == that.finalized &&
            Objects.equals(problem, that.problem) &&
            Objects.equals(benefitRiskNMAOutcomeInclusions, that.benefitRiskNMAOutcomeInclusions) &&
            Objects.equals(benefitRiskStudyOutcomeInclusions, that.benefitRiskStudyOutcomeInclusions);
  }

  @Override
  public int hashCode() {

    return Objects.hash(super.hashCode(), finalized, problem, benefitRiskNMAOutcomeInclusions, benefitRiskStudyOutcomeInclusions);
  }
}
