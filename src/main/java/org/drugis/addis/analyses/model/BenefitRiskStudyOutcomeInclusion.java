package org.drugis.addis.analyses.model;

import com.fasterxml.jackson.annotation.JsonRawValue;
import org.hibernate.annotations.Type;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;
import java.io.Serializable;
import java.net.URI;
import java.util.Objects;

/**
 * Created by joris on 13-6-17.
 */
@Entity
@IdClass(BenefitRiskStudyOutcomeInclusion.BenefitRiskStudyOutcomeInclusionPK.class)
public class BenefitRiskStudyOutcomeInclusion {
  public static class BenefitRiskStudyOutcomeInclusionPK implements Serializable {
    protected Integer analysisId;
    protected Integer outcomeId;

    public BenefitRiskStudyOutcomeInclusionPK() {
    }

    public BenefitRiskStudyOutcomeInclusionPK(Integer analysisId, Integer outcomeId) {
      this.analysisId = analysisId;
      this.outcomeId = outcomeId;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      BenefitRiskStudyOutcomeInclusionPK that = (BenefitRiskStudyOutcomeInclusionPK) o;

      if (!analysisId.equals(that.analysisId)) return false;
      return outcomeId.equals(that.outcomeId);
    }

    @Override
    public int hashCode() {
      int result = analysisId.hashCode();
      result = 31 * result + outcomeId.hashCode();
      return result;
    }
  }

  @Id
  private Integer analysisId;

  @Id
  private Integer outcomeId;
  @Type(type = "org.drugis.addis.util.UriUserType")
  private URI studyGraphUri;

  @JsonRawValue
  private String baseline;

  public BenefitRiskStudyOutcomeInclusion() {
  }

  public BenefitRiskStudyOutcomeInclusion(Integer analysisId, Integer outcomeId, URI studyGraphUri) {
    this.analysisId = analysisId;
    this.outcomeId = outcomeId;
    this.studyGraphUri = studyGraphUri;
    this.baseline = "";
  }

  public BenefitRiskStudyOutcomeInclusion(Integer analysisId, Integer outcomeId, URI studyGraphUri, String baseline) {
    this.analysisId = analysisId;
    this.outcomeId = outcomeId;
    this.studyGraphUri = studyGraphUri;
    this.baseline = baseline;
  }

  public Integer getAnalysisId() {
    return analysisId;
  }

  public Integer getOutcomeId() {
    return outcomeId;
  }

  public URI getStudyGraphUri() {
    return studyGraphUri;
  }

  public String getBaseline() {
    return baseline;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    BenefitRiskStudyOutcomeInclusion that = (BenefitRiskStudyOutcomeInclusion) o;
    return Objects.equals(analysisId, that.analysisId) &&
            Objects.equals(outcomeId, that.outcomeId) &&
            Objects.equals(studyGraphUri, that.studyGraphUri) &&
            Objects.equals(baseline, that.baseline);
  }

  @Override
  public int hashCode() {

    return Objects.hash(analysisId, outcomeId, studyGraphUri, baseline);
  }
}
