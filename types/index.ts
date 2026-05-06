export interface Senior {
  id: string
  name: string
  region: string
  desired_job: string
  career_years: number
}

export interface Job {
  id: string
  title: string
  region: string
  job_type: string
  required_career: number
}

export interface Match {
  id: string
  senior_id: string
  job_id: string
  score: number
}
