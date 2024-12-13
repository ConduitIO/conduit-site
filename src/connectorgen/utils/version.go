package utils

type Version struct {
	CurrentVersion string `json:"currentVersion"`
	UsingLatest    bool   `json:"usingLatest"`
}

func CompareVersions(repoVersion, latestVersion string) bool {
	return repoVersion == latestVersion
}
