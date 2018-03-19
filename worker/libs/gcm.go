package libs

import (
	"github.com/googollee/go-gcm"
)

var client *gcm.Client

func SetGcmClient() {
	if gcm == nil {
		client = gcm.New("AIzaSyAw07MXueTmxrFAj2b7guAixe6nZdZu--I")
	}
}

func SendGcmMessage(gcmKey, title, message, target string) {
	load := gcm.NewMessage(gcmKey)
	load.SetPayload("type", "report")
	load.SetPayload("title", title)
	load.SetPayload("message", message)
	load.SetPayload("action", "OPEN_DETAIL_VIEW")
	load.SetPayload("actionTarge", target)
	load.DelayWhileIdle = true
	load.CollapseKey = "new_report"

	if resp, err := client.Send(load); err != nil {
		panic(err)
	}
}
