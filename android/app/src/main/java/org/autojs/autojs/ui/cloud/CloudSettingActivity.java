package org.autojs.autojs.ui.cloud;


import android.os.Bundle;

import androidx.annotation.Nullable;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.RecyclerView;

import org.androidannotations.annotations.AfterViews;
import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.ViewById;
import org.autojs.autojs.R;
import org.autojs.autojs.ui.BaseActivity;
import org.autojs.autojs.ui.main.MainActivity_;

@EActivity(R.layout.activity_cloud_setting)
public class CloudSettingActivity extends BaseActivity {

    @ViewById(R.id.drawer_menu)
    RecyclerView mDrawerMenu;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applyDayNightMode();
    }
    @AfterViews
    void setupViews() {
        setToolbarAsBack("设置");
    }

}
